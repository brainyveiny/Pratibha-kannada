import type { Metadata } from 'next';
import { AuthShell } from '@/components/auth/AuthShell';
import { RegisterForm } from '@/components/auth/RegisterForm';

export const metadata: Metadata = {
  title: 'ಉಚಿತ ಖಾತೆ ತೆರೆಯಿರಿ — ಪ್ರತಿಭಾ ಕನ್ನಡ',
  description: 'ಪ್ರತಿಭಾ ಕನ್ನಡ ವೇದಿಕೆಯಲ್ಲಿ ಉಚಿತ ಖಾತೆ ತೆರೆಯಿರಿ — ನೋಟ್ಸ್, ವ್ಯಾಕರಣ ಮತ್ತು ಪ್ರಶ್ನೋತ್ತರ ಭಂಡಾರ.',
};

interface RegisterPageProps {
  searchParams: Promise<{ error?: string }>;
}

function getRegisterErrorMessage(error: string | undefined): string | null {
  if (!error) return null;
  switch (error) {
    case 'invalid_email':
      return 'ಮಾನ್ಯವಾದ ಇಮೇಲ್ ವಿಳಾಸವನ್ನು ನಮೂದಿಸಿ (Invalid email address).';
    case 'password_too_short':
      return 'ಪಾಸ್‌ವರ್ಡ್ ಕನಿಷ್ಠ 8 ಅಕ್ಷರಗಳಿರಬೇಕು (Password must be at least 8 characters).';
    case 'user_exists':
      return 'ಈ ಇಮೇಲ್ ಈಗಾಗಲೇ ನೋಂದಾಯಿತವಾಗಿದೆ. ದಯವಿಟ್ಟು ಲಾಗಿನ್ ಮಾಡಿ (An account with this email already exists).';
    case 'unsupported_grade':
      return 'ಆಯ್ಕೆಮಾಡಿದ ತರಗತಿ ಬೆಂಬಲಿತವಾಗಿಲ್ಲ. 8, 9, 10 ಮತ್ತು ಪಿಯುಸಿ ತರಗತಿಗಳು ಮಾತ್ರ ಲಭ್ಯವಿದೆ (Supported classes: 8, 9, 10, 1st & 2nd PUC).';
    case 'invalid_payload':
      return 'ಅಮಾನ್ಯ ವಿನಂತಿ (Invalid request).';
    case 'rate_limit':
      return 'ಹೆಚ್ಚು ನೋಂದಣಿ ಪ್ರಯತ್ನಗಳು. ದಯವಿಟ್ಟು 1 ನಿಮಿಷದ ನಂತರ ಪ್ರಯತ್ನಿಸಿ (Too many attempts. Please wait).';
    default:
      return 'ನೋಂದಣಿ ವಿಫಲವಾಗಿದೆ. ದಯವಿಟ್ಟು ವಿವರಗಳನ್ನು ಪರಿಶೀಲಿಸಿ (Registration failed).';
  }
}

export default async function RegisterPage({ searchParams }: RegisterPageProps) {
  const params = await searchParams;
  const errorMessage = getRegisterErrorMessage(params.error);

  return (
    <AuthShell
      activeTab="register"
      badgeText="100% ಉಚಿತ ನೋಂದಣಿ"
      title="ಉಚಿತ ಖಾತೆ ತೆರೆಯಿರಿ"
      subtitle="8-10ನೇ ತರಗತಿ ಹಾಗೂ ಪಿಯುಸಿ ನೋಟ್ಸ್ ಮತ್ತು ಪ್ರಶ್ನೆ ಪತ್ರಿಕೆಗಳಿಗೆ ಸಂಪೂರ್ಣ ಉಚಿತ ಪ್ರವೇಶ"
      footerPrompt="ಈಗಾಗಲೇ ಖಾತೆ ಇದೆಯೇ?"
      footerActionText="ಲಾಗಿನ್ ಮಾಡಿ"
      footerActionHref="/login"
      footerActionId="register-to-login"
    >
      <RegisterForm initialError={errorMessage} />
    </AuthShell>
  );
}
