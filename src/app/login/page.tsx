import type { Metadata } from 'next';
import { AuthShell } from '@/components/auth/AuthShell';
import { LoginForm } from '@/components/auth/LoginForm';

export const metadata: Metadata = {
  title: 'ಲಾಗಿನ್ — ಪ್ರತಿಭಾ ಕನ್ನಡ',
  description: 'ಪ್ರತಿಭಾ ಕನ್ನಡ ವೇದಿಕೆಗೆ ಲಾಗಿನ್ ಮಾಡಿ — ಸಂಪೂರ್ಣ ಉಚಿತ ಕನ್ನಡ ಅಧ್ಯಯನ ಸಾಮಗ್ರಿಗಳು.',
};

interface LoginPageProps {
  searchParams: Promise<{ error?: string; registered?: string }>;
}

function getErrorMessage(error: string | undefined): string | null {
  if (!error) return null;
  switch (error) {
    case 'missing_password':
      return 'ದಯವಿಟ್ಟು ನಿಮ್ಮ ಪಾಸ್‌ವರ್ಡ್ ನಮೂದಿಸಿ (Password required).';
    case 'invalid_credentials':
      return 'ತಪ್ಪಾದ ಇಮೇಲ್ ಅಥವಾ ಪಾಸ್‌ವರ್ಡ್ (Invalid email or password).';
    case 'admin_required':
      return 'ನಿರ್ವಾಹಕರ ಪುಟಕ್ಕೆ ಪ್ರವೇಶಿಸಲು ಮಾನ್ಯ ನಿರ್ವಾಹಕ ಖಾತೆಯಿಂದ ಲಾಗಿನ್ ಮಾಡಿ (Admin authorization required).';
    case 'invalid_email':
      return 'ಮಾನ್ಯವಾದ ಇಮೇಲ್ ವಿಳಾಸವನ್ನು ನಮೂದಿಸಿ (Invalid email address).';
    case 'invalid_payload':
      return 'ಅಮಾನ್ಯ ವಿನಂತಿ (Invalid request).';
    case 'rate_limit':
      return 'ಹೆಚ್ಚು ಲಾಗಿನ್ ಪ್ರಯತ್ನಗಳು. ದಯವಿಟ್ಟು 1 ನಿಮಿಷದ ನಂತರ ಪ್ರಯತ್ನಿಸಿ (Too many attempts. Please wait).';
    default:
      return 'ಲಾಗಿನ್ ವಿಫಲವಾಗಿದೆ. ದಯವಿಟ್ಟು ಸರಿಯಾದ ವಿವರಗಳೊಂದಿಗೆ ಮತ್ತೊಮ್ಮೆ ಪ್ರಯತ್ನಿಸಿ (Login failed).';
  }
}

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const params = await searchParams;
  const errorMessage = getErrorMessage(params.error);
  const justRegistered = Boolean(params.registered);

  return (
    <AuthShell
      activeTab="login"
      badgeText="ಕನ್ನಡ ಕಲಿಕೆಗೆ ಉಚಿತ ಡಿಜಿಟಲ್ ವೇದಿಕೆ"
      title="ಸ್ವಾಗತ"
      subtitle="ನಿಮ್ಮ ಇಮೇಲ್ ಬಳಸಿ ತಕ್ಷಣ ಲಾಗಿನ್ ಮಾಡಿ ಮತ್ತು ಅಧ್ಯಯನ ಮುಂದುವರಿಸಿ"
      footerPrompt="ಖಾತೆ ಇಲ್ಲವೇ?"
      footerActionText="ಉಚಿತವಾಗಿ ನೋಂದಾಯಿಸಿ"
      footerActionHref="/register"
      footerActionId="login-to-register"
    >
      <LoginForm initialError={errorMessage} justRegistered={justRegistered} />
    </AuthShell>
  );
}
