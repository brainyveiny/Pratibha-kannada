'use client';

import React, { useState } from 'react';

interface LoginFormProps {
  initialError?: string | null;
  justRegistered?: boolean;
}

export function LoginForm({ initialError, justRegistered }: LoginFormProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(initialError || null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    // If native submission is preferred or JS fails, fallback is native form POST
    e.preventDefault();
    setErrorMessage(null);

    const trimmedEmail = email.trim();
    if (!trimmedEmail) {
      setErrorMessage('ದಯವಿಟ್ಟು ನಿಮ್ಮ ಇಮೇಲ್ ವಿಳಾಸವನ್ನು ನಮೂದಿಸಿ (Email required).');
      return;
    }
    if (!password) {
      setErrorMessage('ದಯವಿಟ್ಟು ನಿಮ್ಮ ಪಾಸ್‌ವರ್ಡ್ ನಮೂದಿಸಿ (Password required).');
      return;
    }

    setIsSubmitting(true);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: trimmedEmail,
          password,
        }),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        setErrorMessage(
          data.error || 'ತಪ್ಪಾದ ಇಮೇಲ್ ಅಥವಾ ಪಾಸ್‌ವರ್ಡ್ (Invalid email or password).'
        );
        setIsSubmitting(false);
        return;
      }

      // Success: redirect to destination
      if (data.user?.role === 'admin') {
        window.location.href = '/admin';
      } else {
        window.location.href = '/dashboard';
      }
    } catch {
      // Fallback: submit native form if fetch fails
      const form = e.currentTarget;
      form.submit();
    }
  };

  return (
    <div className="space-y-4">
      {/* Alert banners */}
      {justRegistered && !errorMessage && (
        <div
          role="status"
          className="p-3.5 rounded-2xl bg-emerald-50/90 border border-emerald-200/80 text-emerald-800 text-xs font-medium flex items-center gap-2.5 shadow-sm"
        >
          <svg className="w-4 h-4 text-emerald-600 shrink-0" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
          <span className="kn">ನೋಂದಣಿ ಯಶಸ್ವಿಯಾಗಿದೆ! ದಯವಿಟ್ಟು ನಿಮ್ಮ ವಿವರಗಳೊಂದಿಗೆ ಲಾಗಿನ್ ಮಾಡಿ.</span>
        </div>
      )}

      {errorMessage && (
        <div
          id="login-error-alert"
          role="alert"
          className="p-3.5 rounded-2xl bg-rose-50/90 border border-rose-200/80 text-rose-800 text-xs font-medium flex items-center gap-2.5 shadow-sm animate-fade-up"
        >
          <svg className="w-4 h-4 text-rose-600 shrink-0" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="8" x2="12" y2="12" />
            <line x1="12" y1="16" x2="12.01" y2="16" />
          </svg>
          <span className="kn leading-relaxed">{errorMessage}</span>
        </div>
      )}

      <form
        id="login-form"
        action="/api/auth/login"
        method="POST"
        onSubmit={handleSubmit}
        className="space-y-4"
        noValidate
      >
        {/* Email Field */}
        <div>
          <label htmlFor="login-email" className="block text-xs font-semibold text-neutral-700 kn tracking-wide mb-1.5">
            ಇಮೇಲ್ ವಿಳಾಸ <span className="text-neutral-400 font-normal">(Email)</span>
          </label>
          <div className="relative">
            <input
              id="login-email"
              name="email"
              type="email"
              autoComplete="email"
              required
              disabled={isSubmitting}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="student@example.com"
              className="w-full rounded-xl sm:rounded-2xl border border-neutral-200/90 bg-white/70 backdrop-blur-md px-4 py-3 text-sm text-neutral-900 placeholder:text-neutral-400 shadow-sm transition-all duration-200 focus:border-orange-500/80 focus:bg-white focus:outline-none focus:ring-4 focus:ring-orange-500/10 disabled:opacity-60 disabled:cursor-not-allowed"
            />
          </div>
        </div>

        {/* Password Field */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label htmlFor="login-password" className="block text-xs font-semibold text-neutral-700 kn tracking-wide">
              ಪಾಸ್‌ವರ್ಡ್ <span className="text-neutral-400 font-normal">(Password)</span>
            </label>
          </div>
          <div className="relative">
            <input
              id="login-password"
              name="password"
              type={showPassword ? 'text' : 'password'}
              autoComplete="current-password"
              required
              disabled={isSubmitting}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full rounded-xl sm:rounded-2xl border border-neutral-200/90 bg-white/70 backdrop-blur-md pl-4 pr-11 py-3 text-sm text-neutral-900 placeholder:text-neutral-400 shadow-sm transition-all duration-200 focus:border-orange-500/80 focus:bg-white focus:outline-none focus:ring-4 focus:ring-orange-500/10 disabled:opacity-60 disabled:cursor-not-allowed"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              aria-label={showPassword ? 'ಪಾಸ್‌ವರ್ಡ್ ಮರೆಮಾಡಿ (Hide password)' : 'ಪಾಸ್‌ವರ್ಡ್ ತೋರಿಸಿ (Show password)'}
              aria-pressed={showPassword}
              disabled={isSubmitting}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-700 p-1.5 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-orange-500/20"
            >
              {showPassword ? (
                // Eye off icon
                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l18 18" />
                </svg>
              ) : (
                // Eye icon
                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
              )}
            </button>
          </div>
        </div>

        {/* Submit Button */}
        <button
          id="login-submit"
          type="submit"
          disabled={isSubmitting}
          className="btn-notion-dark w-full !py-3.5 !rounded-xl sm:!rounded-2xl text-sm sm:text-base font-semibold shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-70 disabled:cursor-not-allowed mt-2"
        >
          {isSubmitting ? (
            <>
              <svg className="w-4 h-4 animate-spin text-white" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
              </svg>
              <span className="kn">ಪರಿಶೀಲಿಸಲಾಗುತ್ತಿದೆ...</span>
            </>
          ) : (
            <>
              <span className="kn">ಲಾಗಿನ್ ಮಾಡಿ</span>
              <span>→</span>
            </>
          )}
        </button>
      </form>
    </div>
  );
}
