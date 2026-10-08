import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: {
    default: 'Pratibha Kannada — ಉಚಿತ ಕನ್ನಡ ಕಲಿಕಾ ವೇದಿಕೆ',
    template: '%s | Pratibha Kannada',
  },
  description:
    'ಕನ್ನಡ ವಿದ್ಯಾರ್ಥಿಗಳಿಗಾಗಿ ಉಚಿತ ಡಿಜಿಟಲ್ ಕಲಿಕಾ ವೇದಿಕೆ. ನೋಟ್ಸ್, ವ್ಯಾಕರಣ, ಪ್ರಶ್ನೆ ಪತ್ರಿಕೆ ಮತ್ತು ಹೆಚ್ಚಿನ ಸಂಪನ್ಮೂಲಗಳು.',
  keywords: ['ಕನ್ನಡ', 'ಕಲಿಕೆ', 'ನೋಟ್ಸ್', 'ಪ್ರಶ್ನೆ ಪತ್ರಿಕೆ', 'SSLC', 'Kannada education'],
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'),
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="kn">
      <body className="min-h-screen antialiased">{children}</body>
    </html>
  );
}
