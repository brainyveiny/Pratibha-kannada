'use client';

import React, { useTransition } from 'react';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { useLanguageMode, type LanguageMode } from '@/lib/languageModeStore';

export interface SearchModeToggleProps {
  initialMode?: 'kn' | 'en' | 'kannada' | 'english';
  className?: string;
  showHelperBadge?: boolean;
}

export function SearchModeToggle({
  className = '',
  showHelperBadge = false,
}: SearchModeToggleProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const [, startTransition] = useTransition();

  const { mode, isEnglish, setMode, toggleMode } = useLanguageMode();

  const handleSelectMode = (targetMode: LanguageMode) => {
    setMode(targetMode);

    // If currently on dashboard with an active search query or filter, keep query parameters synchronized
    if (pathname === '/dashboard' || pathname === '/resources') {
      const currentParams = new URLSearchParams(searchParams?.toString() || '');
      currentParams.set('mode', targetMode === 'english' ? 'en' : 'kn');
      startTransition(() => {
        router.push(`${pathname}?${currentParams.toString()}`);
      });
    }
  };

  return (
    <div className={`inline-flex items-center gap-1.5 ${className}`}>
      {/* Accessible Segmented Pill Toggle */}
      <div
        role="group"
        aria-label="ಭಾಷಾ ಮೋಡ್ ಆಯ್ಕೆ (Language search mode selection)"
        className="inline-flex items-center p-0.5 rounded-full bg-neutral-100/90 border border-neutral-200/80 shadow-xs transition-all"
      >
        {/* Kannada Mode Button */}
        <button
          type="button"
          onClick={() => handleSelectMode('kannada')}
          id="search-mode-toggle-kn"
          className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-orange-500/20 ${
            !isEnglish
              ? 'bg-white text-orange-700 shadow-xs font-bold'
              : 'text-neutral-500 hover:text-neutral-900 hover:bg-white/40'
          }`}
          aria-pressed={!isEnglish}
          title="ಕನ್ನಡ ಲಿಪಿ ಮೋಡ್ (Default Kannada script)"
        >
          <span className="kn text-[11px] sm:text-xs">ಕನ್ನಡ</span>
        </button>

        {/* English-Letter Transliteration Mode Button */}
        <button
          type="button"
          onClick={() => handleSelectMode('english')}
          id="search-mode-toggle-en"
          className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-orange-500/20 ${
            isEnglish
              ? 'bg-white text-orange-700 shadow-xs font-bold'
              : 'text-neutral-500 hover:text-neutral-900 hover:bg-white/40'
          }`}
          aria-pressed={isEnglish}
          title="English ಅಕ್ಷರಗಳ ಮೂಲಕ ಕನ್ನಡ ಹುಡುಕಾಟ (Search Kannada using English letters)"
        >
          <span className="hidden sm:inline">English letters</span>
          <span className="sm:hidden font-mono text-[11px]">En</span>
        </button>
      </div>

      {/* Status helper badge */}
      {showHelperBadge && isEnglish && (
        <span className="hidden lg:inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium bg-orange-50 text-orange-700 border border-orange-200/60">
          En ➔ ಕ ಸಕ್ರಿಯ
        </span>
      )}
    </div>
  );
}
