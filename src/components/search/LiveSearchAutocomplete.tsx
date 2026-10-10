'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useLanguageMode } from '@/lib/languageModeStore';
import type { SearchSuggestion } from '@/lib/searchSuggestions';

export interface LiveSearchAutocompleteProps {
  variant?: 'hero' | 'compact';
  defaultValue?: string;
  placeholder?: string;
  activeClass?: string;
  activeCat?: string;
  formAction?: string;
  inputId?: string;
  formId?: string;
  buttonId?: string;
  className?: string;
  autoFocus?: boolean;
}

export function LiveSearchAutocomplete({
  variant = 'compact',
  defaultValue = '',
  placeholder,
  activeClass,
  activeCat,
  formAction = '/dashboard',
  inputId = 'live-search-input',
  formId = 'live-search-form',
  buttonId = 'live-search-btn',
  className = '',
  autoFocus = false,
}: LiveSearchAutocompleteProps) {
  const router = useRouter();
  const { isEnglish, mode } = useLanguageMode();
  const shortMode = isEnglish ? 'en' : 'kn';

  const [query, setQuery] = useState(defaultValue);
  const [suggestions, setSuggestions] = useState<SearchSuggestion[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [isLoading, setIsLoading] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  // Sync external defaultValue updates (e.g. navigation / query param change)
  useEffect(() => {
    setQuery(defaultValue);
  }, [defaultValue]);

  // Compute dynamic placeholder if not explicitly provided
  const resolvedPlaceholder =
    placeholder ||
    (isEnglish
      ? 'English ಅಕ್ಷರಗಳಲ್ಲಿ ಟೈಪ್ ಮಾಡಿ (ಉದಾ: ganitha, sandhi, vyakarana)...'
      : 'ಹುಡುಕಿ — ಸಂಧಿ, ಯುದ್ಧ, ಗಾದೆ, 2025 ಪೇಪರ್, ಕುವೆಂಪು...');

  // Debounced fetch for suggestions
  const fetchSuggestions = useCallback(
    async (searchQuery: string) => {
      const trimmed = searchQuery.trim();
      if (!trimmed) {
        setSuggestions([]);
        setIsOpen(false);
        setIsLoading(false);
        return;
      }

      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }

      const controller = new AbortController();
      abortControllerRef.current = controller;
      setIsLoading(true);

      try {
        const params = new URLSearchParams({
          q: trimmed,
          mode: shortMode,
          limit: '7',
        });
        if (activeClass) params.set('class', activeClass);
        if (activeCat) params.set('cat', activeCat);

        const res = await fetch(`/api/search/suggestions?${params.toString()}`, {
          signal: controller.signal,
          headers: { Accept: 'application/json' },
        });

        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();

        if (!controller.signal.aborted) {
          setSuggestions(data.suggestions || []);
          setIsOpen(true);
          setSelectedIndex(-1);
          setIsLoading(false);
        }
      } catch (err: any) {
        if (err.name !== 'AbortError') {
          setSuggestions([]);
          setIsLoading(false);
        }
      }
    },
    [shortMode, activeClass, activeCat]
  );

  // Handle typing with 180ms debounce
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setQuery(val);
    fetchSuggestions(val);
  };

  // Close on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!isOpen || suggestions.length === 0) {
      if (e.key === 'ArrowDown' && query.trim()) {
        e.preventDefault();
        fetchSuggestions(query);
      }
      return;
    }

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev < suggestions.length - 1 ? prev + 1 : 0));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev > 0 ? prev - 1 : suggestions.length - 1));
    } else if (e.key === 'Escape') {
      e.preventDefault();
      setIsOpen(false);
    } else if (e.key === 'Enter') {
      if (selectedIndex >= 0 && selectedIndex < suggestions.length) {
        e.preventDefault();
        const selected = suggestions[selectedIndex];
        handleSelectSuggestion(selected);
      }
      // If selectedIndex === -1, default form submission will trigger naturally
    }
  };

  // Suggestion click/tap handler
  const handleSelectSuggestion = (suggestion: SearchSuggestion) => {
    setIsOpen(false);
    if (suggestion.type === 'query') {
      // Set query and submit
      setQuery(suggestion.matchedTerm);
      router.push(suggestion.url);
    } else {
      router.push(suggestion.url);
    }
  };

  const isHero = variant === 'hero';

  return (
    <div ref={containerRef} className={`relative w-full ${className}`}>
      <form action={formAction} method="GET" id={formId} className="relative w-full group">
        {activeClass && <input type="hidden" name="class" value={activeClass} />}
        {activeCat && <input type="hidden" name="cat" value={activeCat} />}
        <input type="hidden" name="mode" value={shortMode} />

        {isHero ? (
          // Hero variant: Floating pill with rich border effects
          <div className="iphone-glass rounded-2xl p-2 sm:p-2.5 flex items-center gap-3 transition-all duration-300 group-hover:shadow-[0_16px_45px_-8px_rgba(230,120,30,0.12)] group-focus-within:border-orange-400/80 group-focus-within:ring-4 group-focus-within:ring-orange-500/10">
            <div className="pl-2.5 text-neutral-400 shrink-0">
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-orange-500 border-t-transparent rounded-full animate-spin" />
              ) : (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <circle cx="11" cy="11" r="8" />
                  <path d="m21 21-4.35-4.35" />
                </svg>
              )}
            </div>
            <input
              ref={inputRef}
              id={inputId}
              name="q"
              type="search"
              autoComplete="off"
              role="combobox"
              aria-autocomplete="list"
              aria-expanded={isOpen}
              aria-controls={`${inputId}-suggestions`}
              aria-activedescendant={
                selectedIndex >= 0 && suggestions[selectedIndex]
                  ? `${inputId}-item-${selectedIndex}`
                  : undefined
              }
              value={query}
              onChange={handleInputChange}
              onFocus={() => {
                if (query.trim() && suggestions.length > 0) setIsOpen(true);
              }}
              onKeyDown={handleKeyDown}
              placeholder={resolvedPlaceholder}
              autoFocus={autoFocus}
              className="w-full bg-transparent text-sm sm:text-base text-neutral-900 placeholder:text-neutral-400 outline-none kn font-medium"
              aria-label="ಸಂಪನ್ಮೂಲ ಹುಡುಕಿ"
            />
            <button
              type="submit"
              id={buttonId}
              className="btn-notion-dark text-xs sm:text-sm !py-2 !px-5 !rounded-xl shrink-0"
            >
              ಹುಡುಕಿ
            </button>
          </div>
        ) : (
          // Compact variant: Clean rounded navbar input
          <div className="relative flex items-center w-full">
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
              {isLoading ? (
                <div className="w-4 h-4 border-2 border-orange-500 border-t-transparent rounded-full animate-spin" />
              ) : (
                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <circle cx="11" cy="11" r="8" />
                  <path d="m21 21-4.35-4.35" />
                </svg>
              )}
            </div>
            <input
              ref={inputRef}
              id={inputId}
              name="q"
              type="search"
              autoComplete="off"
              role="combobox"
              aria-autocomplete="list"
              aria-expanded={isOpen}
              aria-controls={`${inputId}-suggestions`}
              aria-activedescendant={
                selectedIndex >= 0 && suggestions[selectedIndex]
                  ? `${inputId}-item-${selectedIndex}`
                  : undefined
              }
              value={query}
              onChange={handleInputChange}
              onFocus={() => {
                if (query.trim() && suggestions.length > 0) setIsOpen(true);
              }}
              onKeyDown={handleKeyDown}
              placeholder={resolvedPlaceholder}
              autoFocus={autoFocus}
              className="input pl-9 pr-24 py-2 text-sm rounded-full w-full"
              aria-label="ಸಂಪನ್ಮೂಲ ಹುಡುಕಿ"
            />
            <button
              type="submit"
              id={buttonId}
              className="absolute right-1.5 top-1/2 -translate-y-1/2 btn-primary text-xs py-1 px-3.5 rounded-full"
            >
              ಹುಡುಕಿ
            </button>
          </div>
        )}
      </form>

      {/* Autocomplete Dropdown Menu */}
      {isOpen && (
        <div
          id={`${inputId}-suggestions`}
          role="listbox"
          aria-label="ಹುಡುಕಾಟ ಸಲಹೆಗಳು"
          className="absolute left-0 right-0 top-full mt-2 z-50 bg-white/95 backdrop-blur-md rounded-2xl shadow-xl border border-neutral-200/80 overflow-hidden divide-y divide-neutral-100 max-h-80 overflow-y-auto animate-in fade-in slide-in-from-top-1 duration-150"
        >
          {suggestions.length > 0 ? (
            suggestions.map((item, index) => {
              const isSelected = index === selectedIndex;
              return (
                <div
                  key={item.id}
                  id={`${inputId}-item-${index}`}
                  role="option"
                  aria-selected={isSelected}
                  onClick={() => handleSelectSuggestion(item)}
                  onMouseEnter={() => setSelectedIndex(index)}
                  className={`px-4 py-3 cursor-pointer flex items-center justify-between gap-3 transition-colors min-h-[44px] ${
                    isSelected ? 'bg-orange-50/90 text-orange-950' : 'hover:bg-neutral-50 text-neutral-800'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <span className="shrink-0 text-base">
                      {item.type === 'topic' ? '🏷️' : item.type === 'resource' ? '📚' : '🔍'}
                    </span>
                    <div className="min-w-0">
                      <div className="text-sm font-semibold truncate kn">
                        {item.title}
                        {item.titleEn && (
                          <span className="ml-1.5 text-xs text-neutral-400 font-normal">
                            ({item.titleEn})
                          </span>
                        )}
                      </div>
                      {item.subtitle && (
                        <div className="text-xs text-neutral-500 truncate kn">
                          {item.subtitle}
                        </div>
                      )}
                    </div>
                  </div>

                  {item.badge && (
                    <span className="shrink-0 text-[11px] font-medium px-2 py-0.5 rounded-full bg-neutral-100 text-neutral-600 border border-neutral-200/60 kn">
                      {item.badge}
                    </span>
                  )}
                </div>
              );
            })
          ) : (
            <div className="px-4 py-3 text-center text-xs text-neutral-400 kn">
              ಯಾವುದೇ ಫಲಿತಾಂಶಗಳು ಸಿಗಲಿಲ್ಲ (No direct matches)
            </div>
          )}
        </div>
      )}
    </div>
  );
}
