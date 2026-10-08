import { NextResponse, type NextRequest } from 'next/server';
import {
  validateFileUpload,
  validateCsrfOrigin,
  verifyAdminAccess,
  checkRateLimit,
  getClientIp,
} from '@/lib/security';

export async function POST(request: NextRequest) {
  // 1. CSRF Protection
  if (!validateCsrfOrigin(request)) {
    return NextResponse.json(
      { error: 'CSRF ಪರಿಶೀಲನೆ ವಿಫಲವಾಗಿದೆ (Forbidden request origin)' },
      { status: 403 }
    );
  }

  // 2. Rate Limiting
  const clientIp = getClientIp(request);
  const rateCheck = checkRateLimit(`upload_${clientIp}`, 10, 60000);
  if (!rateCheck.allowed) {
    return NextResponse.json(
      { error: 'ಹೆಚ್ಚು ಅಪ್‌ಲೋಡ್ ಪ್ರಯತ್ನಗಳು (Rate limit exceeded)' },
      { status: 429, headers: { 'Retry-After': '60' } }
    );
  }

  // 3. Admin Permission Check (Strict: NO DEV BYPASS)
  const adminCheck = verifyAdminAccess(request);
  if (!adminCheck.authorized) {
    return NextResponse.json(
      { error: 'ಕೇವಲ ನಿರ್ವಾಹಕರಿಗೆ ಮಾತ್ರ ಫೈಲ್ ಅಪ್‌ಲೋಡ್ ಅನುಮತಿ ಇದೆ (Admin authorization required)' },
      { status: 403 }
    );
  }

  try {
    const formData = await request.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return NextResponse.json(
        { error: 'ಯಾವುದೇ ಫೈಲ್ ಆಯ್ಕೆ ಮಾಡಲಾಗಿಲ್ಲ (No file uploaded)' },
        { status: 400 }
      );
    }

    // 4. Validate file type, size, extension & sanitize filename
    const validation = validateFileUpload(file);
    if (!validation.valid || !validation.sanitizedFilename) {
      return NextResponse.json({ error: validation.error }, { status: 400 });
    }

    // 5. Upload to Supabase Storage if configured
    if (process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY) {
      try {
        const { createClient } = await import('@supabase/supabase-js');
        const supabase = createClient(
          process.env.NEXT_PUBLIC_SUPABASE_URL,
          process.env.SUPABASE_SERVICE_ROLE_KEY
        );

        const bucketName = process.env.SUPABASE_STORAGE_BUCKET || 'educational-resources';
        const buffer = Buffer.from(await file.arrayBuffer());
        const { data, error } = await supabase.storage
          .from(bucketName)
          .upload(`uploads/${validation.sanitizedFilename}`, buffer, {
            contentType: file.type,
            upsert: false,
          });

        if (error) {
          return NextResponse.json(
            { error: 'ಫೈಲ್ ಉಳಿಸಲು ವಿಫಲವಾಗಿದೆ (Storage error)' },
            { status: 500 }
          );
        }

        const { data: publicUrlData } = supabase.storage
          .from(bucketName)
          .getPublicUrl(data.path);

        return NextResponse.json({
          success: true,
          url: publicUrlData.publicUrl,
          filename: validation.sanitizedFilename,
        });
      } catch {
        return NextResponse.json(
          { error: 'ಸ್ಟೋರೇಜ್ ಸಂಪರ್ಕ ದೋಷ (Storage connection error)' },
          { status: 500 }
        );
      }
    }

    // Local / validated fallback
    return NextResponse.json({
      success: true,
      filename: validation.sanitizedFilename,
      url: `/uploads/${validation.sanitizedFilename}`,
      message: 'ಫೈಲ್ ಪರಿಶೀಲನೆ ಯಶಸ್ವಿಯಾಗಿದೆ (File validated successfully)',
    });
  } catch {
    return NextResponse.json(
      { error: 'ಫೈಲ್ ಪ್ರಕ್ರಿಯೆಗೊಳಿಸಲು ಸಾಧ್ಯವಾಗಲಿಲ್ಲ (Upload processing error)' },
      { status: 500 }
    );
  }
}
