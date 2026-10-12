'use client';

import React, { useState } from 'react';
import { SUPPORTED_CLASSES } from '@/data/classes';

interface RegisterFormProps {
  initialError?: string | null;
}

export function RegisterForm({ initialError }: RegisterFormProps) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [grade, setGrade] = useState('10');
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(initialError || null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrorMessage(null);

    const trimmedEmail = email.trim();
    if (!trimmedEmail) {
      setErrorMessage('ದಯವಿಟ್ಟು ನಿಮ್ಮ ಇಮೇಲ್ ವಿಳಾಸವನ್ನು ನಮೂದಿಸಿ (Email is required).');
      return;
    }

    if (!password || password.length < 8) {
      setErrorMessage(
        'ಪಾಸ್‌ವರ್ಡ್ ಕನಿಷ್ಠ 8 ಅಕ್ಷರಗಳಿರಬೇಕು (Password must be at least 8 characters).'
      );
      return;
    }

    setIsSubmitting(true);

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          display_name: name.trim(),
          email: trimmedEmail,
          password,
          grade,
        }),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        if (res.status === 409) {
          setErrorMessage(
            'ಈ ಇಮೇಲ್ ಈಗಾಗಲೇ ನೋಂದಾಯಿತವಾಗಿದೆ. ದಯವಿಟ್ಟು ಲಾಗಿನ್ ಮಾಡಿ (An account with this email already exists).'
          );
        } else {
          setErrorMessage(
            data.error || 'ನೋಂದಣಿ ವಿಫಲವಾಗಿದೆ. ದಯವಿಟ್ಟು ವಿವರಗಳನ್ನು ಪರಿಶೀಲಿಸಿ (Registration failed).'
          );
        }
        setIsSubmitting(false);
        return;
      }

      // Success: redirect to dashboard with welcome flag
      window.location.href = '/dashboard?welcome=1';
    } catch {
      // Fallback: native form submit
      const form = e.currentTarget;
      form.submit();
    }
  };

  return (
    <div className="space-y-4">
      {errorMessage && (
        <div
          id="register-error-alert"
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
        id="register-form"
        action="/api/auth/register"
        method="POST"
        onSubmit={handleSubmit}
        className="space-y-4"
        noValidate
      >
        {/* Name Field (Optional for minor student privacy) */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label htmlFor="register-name" className="block text-sm font-semibold text-neutral-700 kn tracking-wide">
              ವಿದ್ಯಾರ್ಥಿ ಹೆಸರು <span className="text-neutral-400 font-normal">(Student Name)</span>
            </label>
            <span className="text-xs text-neutral-400 font-medium">ಐಚ್ಛಿಕ (Optional)</span>
          </div>
          <input
            id="register-name"
            name="display_name"
            type="text"
            autoComplete="name"
            disabled={isSubmitting}
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="ಉದಾ: ರಾಹುಲ್ ಕುಮಾರ್"
            className="w-full rounded-xl sm:rounded-2xl border border-neutral-200/90 bg-white/70 backdrop-blur-md px-4 py-3 min-h-[48px] text-base sm:text-sm text-neutral-900 placeholder:text-neutral-400 shadow-sm transition-all duration-200 focus:border-orange-500/80 focus:bg-white focus:outline-none focus:ring-4 focus:ring-orange-500/10 disabled:opacity-60 disabled:cursor-not-allowed"
          />
        </div>

        {/* Email Field */}
        <div>
          <label htmlFor="register-email" className="block text-sm font-semibold text-neutral-700 kn tracking-wide mb-1.5">
            ಇಮೇಲ್ ವಿಳಾಸ <span className="text-neutral-400 font-normal">(Email)</span>
          </label>
          <input
            id="register-email"
            name="email"
            type="email"
            autoComplete="email"
            required
            disabled={isSubmitting}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="student@example.com"
            className="w-full rounded-xl sm:rounded-2xl border border-neutral-200/90 bg-white/70 backdrop-blur-md px-4 py-3 min-h-[48px] text-base sm:text-sm text-neutral-900 placeholder:text-neutral-400 shadow-sm transition-all duration-200 focus:border-orange-500/80 focus:bg-white focus:outline-none focus:ring-4 focus:ring-orange-500/10 disabled:opacity-60 disabled:cursor-not-allowed"
          />
        </div>

        {/* Password Field */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label htmlFor="register-password" className="block text-sm font-semibold text-neutral-700 kn tracking-wide">
              ಪಾಸ್‌ವರ್ಡ್ <span className="text-neutral-400 font-normal">(Password)</span>
            </label>
            <span className="text-xs text-orange-700 font-semibold kn">ಕನಿಷ್ಠ 8 ಅಕ್ಷರಗಳು</span>
          </div>
          <div className="relative">
            <input
              id="register-password"
              name="password"
              type={showPassword ? 'text' : 'password'}
              autoComplete="new-password"
              required
              minLength={8}
              disabled={isSubmitting}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="ಕನಿಷ್ಠ 8 ಅಕ್ಷರಗಳ ಪಾಸ್‌ವರ್ಡ್"
              className="w-full rounded-xl sm:rounded-2xl border border-neutral-200/90 bg-white/70 backdrop-blur-md pl-4 pr-12 py-3 min-h-[48px] text-base sm:text-sm text-neutral-900 placeholder:text-neutral-400 shadow-sm transition-all duration-200 focus:border-orange-500/80 focus:bg-white focus:outline-none focus:ring-4 focus:ring-orange-500/10 disabled:opacity-60 disabled:cursor-not-allowed"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              aria-label={showPassword ? 'ಪಾಸ್‌ವರ್ಡ್ ಮರೆಮಾಡಿ (Hide password)' : 'ಪಾಸ್‌ವರ್ಡ್ ತೋರಿಸಿ (Show password)'}
              aria-pressed={showPassword}
              disabled={isSubmitting}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-700 p-2 min-w-[40px] min-h-[40px] flex items-center justify-center rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-orange-500/20"
            >
              {showPassword ? (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l18 18" />
                </svg>
              ) : (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
              )}
            </button>
          </div>
        </div>

        {/* Grade Selector */}
        <div>
          <label htmlFor="register-grade" className="block text-sm font-semibold text-neutral-700 kn tracking-wide mb-1.5">
            ನಿಮ್ಮ ತರಗತಿ <span className="text-neutral-400 font-normal">(Class / Grade)</span>
          </label>
          <div className="relative">
            <select
              id="register-grade"
              name="grade"
              disabled={isSubmitting}
              value={grade}
              onChange={(e) => setGrade(e.target.value)}
              className="w-full appearance-none rounded-xl sm:rounded-2xl border border-neutral-200/90 bg-white/70 backdrop-blur-md px-4 py-3 min-h-[48px] text-base sm:text-sm text-neutral-900 shadow-sm transition-all duration-200 focus:border-orange-500/80 focus:bg-white focus:outline-none focus:ring-4 focus:ring-orange-500/10 disabled:opacity-60 disabled:cursor-not-allowed kn font-medium pr-10"
            >
              {SUPPORTED_CLASSES.map((c) => (
                <option key={c.slug} value={c.slug}>
                  {c.labelKn} ({c.labelEn})
                </option>
              ))}
            </select>
            <div className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-neutral-500">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>
        </div>

        {/* Submit Button */}
        <button
          id="register-submit"
          type="submit"
          disabled={isSubmitting}
          className="btn-notion-dark w-full !py-3.5 min-h-[48px] !rounded-xl sm:!rounded-2xl text-base font-semibold shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-70 disabled:cursor-not-allowed mt-2"
        >
          {isSubmitting ? (
            <>
              <svg className="w-5 h-5 animate-spin text-white" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
              </svg>
              <span className="kn">ಖಾತೆ ರಚಿಸಲಾಗುತ್ತಿದೆ...</span>
            </>
          ) : (
            <>
              <span className="kn">ಉಚಿತ ಖಾತೆ ತೆರೆಯಿರಿ</span>
              <span>→</span>
            </>
          )}
        </button>
      </form>
    </div>
  );
}
