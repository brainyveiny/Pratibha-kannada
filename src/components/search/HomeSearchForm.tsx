'use client';

import React from 'react';
import Link from 'next/link';
import { useLanguageMode } from '@/lib/languageModeStore';
import { LiveSearchAutocomplete } from './LiveSearchAutocomplete';

interface HomeSearchFormProps {
  initialMode?: 'kn' | 'en' | 'kannada' | 'english';
}

const QUICK_SEARCH_TAGS = [
  { label: 'ಸಂಧಿ ನಿಯಮಗಳು', q: 'ಸಂಧಿ' },
  { label: '10ನೇ ಗದ್ಯ ಯುದ್ಧ', q: 'ಯುದ್ಧ' },
  { label: '2025 ಮಾದರಿ ಪೇಪರ್', q: '2025' },
  { label: 'ಕುವೆಂಪು ಪರಿಚಯ', q: 'ಕುವೆಂಪು' },
];

export function HomeSearchForm({ initialMode = 'kannada' }: HomeSearchFormProps) {
  const { isEnglish, mode } = useLanguageMode();

  return (
    <div className="fade-up fade-up-3 mx-auto max-w-xl mb-8">
      <LiveSearchAutocomplete
        variant="hero"
        formAction="/dashboard"
        inputId="home-search-input"
        formId="home-search-form"
        buttonId="home-search-submit"
      />

      {/* Quick search tags */}
      <div className="flex flex-wrap items-center justify-center gap-2 mt-3 text-xs text-neutral-500">
        <span className="text-neutral-400">ಜನಪ್ರಿಯ:</span>
        {QUICK_SEARCH_TAGS.map((item) => (
          <Link
            key={item.label}
            href={`/dashboard?q=${encodeURIComponent(item.q)}${isEnglish ? '&mode=en' : ''}`}
            className="px-2.5 py-1 rounded-lg iphone-glass-pill hover:text-orange-700 transition"
          >
            {item.label}
          </Link>
        ))}
      </div>
    </div>
  );
}
