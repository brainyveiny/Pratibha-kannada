import { NextResponse, type NextRequest } from 'next/server';
import { verifyWebhookSignature } from '@/lib/security';

export async function POST(request: NextRequest) {
  const webhookSecret = process.env.SUPABASE_WEBHOOK_SECRET;

  // In production, enforce webhook signature verification
  if (webhookSecret) {
    const signature = request.headers.get('x-supabase-signature') || request.headers.get('x-webhook-signature');
    const rawBody = await request.text();

    const isValid = verifyWebhookSignature(rawBody, signature, webhookSecret);
    if (!isValid) {
      return NextResponse.json(
        { error: 'ಅಮಾನ್ಯ ವೆಬ್‌ಹುಕ್ ಸಹಿ (Invalid webhook signature)' },
        { status: 401 }
      );
    }

    try {
      const payload = JSON.parse(rawBody);
      // Process verified payload
      return NextResponse.json({ received: true, event: payload.type || 'verified' });
    } catch {
      return NextResponse.json({ error: 'ಅಮಾನ್ಯ JSON ಪೇಲೋಡ್' }, { status: 400 });
    }
  }

  return NextResponse.json({ received: true, message: 'Webhook received (dev mode)' });
}
