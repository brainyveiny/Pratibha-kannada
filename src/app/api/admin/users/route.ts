import { NextResponse, type NextRequest } from 'next/server';
import { getAllUsers, getUserStats } from '@/lib/userStore';
import {
  checkRateLimit,
  getClientIp,
  sanitizeCsvCell,
  verifyAdminAccess,
} from '@/lib/security';

export async function GET(request: NextRequest) {
  // 1. Rate limiting on admin queries
  const clientIp = getClientIp(request);
  const rateCheck = checkRateLimit(`admin_${clientIp}`, 30, 60000);
  if (!rateCheck.allowed) {
    return NextResponse.json(
      { error: 'ಹೆಚ್ಚು ವಿನಂತಿಗಳು. ದಯವಿಟ್ಟು ನಿರೀಕ್ಷಿಸಿ (Rate limit exceeded)' },
      { status: 429, headers: { 'Retry-After': '60' } }
    );
  }

  // 2. Strict server-side permission check (NO DEV BYPASS)
  const adminCheck = verifyAdminAccess(request);
  if (!adminCheck.authorized) {
    return NextResponse.json(
      { error: 'ಅನಧಿಕೃತ ಪ್ರವೇಶ: ನಿರ್ವಾಹಕರ ದೃಢೀಕರಣ ಅಗತ್ಯವಿದೆ (Unauthorized: Admin credentials required)' },
      { status: 403 }
    );
  }

  const { searchParams } = new URL(request.url);
  const shouldExport = searchParams.get('export') === 'csv';

  const users = getAllUsers();

  if (shouldExport) {
    // Generate CSV with CSV Formula Injection / XSS in Excel protection
    const headers = [
      'ID',
      'ಹೆಸರು (Name)',
      'ಇಮೇಲ್ (Email)',
      'ತರಗತಿ (Grade)',
      'ಪಾತ್ರ (Role)',
      'ನೋಂದಣಿ ದಿನಾಂಕ (Registered At)',
      'ಕೊನೆಯ ಲಾಗಿನ್ (Last Login)',
    ];

    const rows = users.map((u) => [
      sanitizeCsvCell(u.id),
      sanitizeCsvCell(u.name),
      sanitizeCsvCell(u.email),
      sanitizeCsvCell(u.grade),
      sanitizeCsvCell(u.role || 'student'),
      sanitizeCsvCell(u.registeredAt),
      sanitizeCsvCell(u.lastLoginAt),
    ]);

    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');

    return new NextResponse(csvContent, {
      status: 200,
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': `attachment; filename="pratibha_kannada_users_${new Date().toISOString().split('T')[0]}.csv"`,
        'X-Content-Type-Options': 'nosniff',
      },
    });
  }

  const stats = getUserStats();
  return NextResponse.json({
    total: stats.total,
    gradeCounts: stats.gradeCounts,
    users,
  });
}
