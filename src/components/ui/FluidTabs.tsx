'use client';

import React, { useRef, useEffect, useState } from 'react';

export interface TabItem {
  id: string;
  label: string;
  sub?: string;
  count?: number | string;
}

interface FluidTabsProps {
  tabs: TabItem[];
  activeId: string;
  onChange: (id: string) => void;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  ariaLabel?: string;
}

export function FluidTabs({
  tabs,
  activeId,
  onChange,
  className = '',
  size = 'md',
  ariaLabel = 'ವರ್ಗೀಕರಣ ಟ್ಯಾಬ್‌ಗಳು (Categorization tabs)',
}: FluidTabsProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [indicatorStyle, setIndicatorStyle] = useState<{ left: number; width: number }>({
    left: 0,
    width: 0,
  });
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    const updateIndicator = () => {
      if (!containerRef.current) return;
      const activeButton = containerRef.current.querySelector<HTMLButtonElement>(
        `button[data-tab-id="${activeId}"]`
      );
      if (activeButton) {
        const containerRect = containerRef.current.getBoundingClientRect();
        const buttonRect = activeButton.getBoundingClientRect();
        setIndicatorStyle({
          left: buttonRect.left - containerRect.left + containerRef.current.scrollLeft,
          width: buttonRect.width,
        });
        setIsReady(true);
      }
    };

    updateIndicator();
    window.addEventListener('resize', updateIndicator);
    return () => window.removeEventListener('resize', updateIndicator);
  }, [activeId, tabs]);

  const handleKeyDown = (e: React.KeyboardEvent, currentIndex: number) => {
    let nextIndex = currentIndex;
    if (e.key === 'ArrowRight') {
      nextIndex = (currentIndex + 1) % tabs.length;
    } else if (e.key === 'ArrowLeft') {
      nextIndex = (currentIndex - 1 + tabs.length) % tabs.length;
    } else if (e.key === 'Home') {
      nextIndex = 0;
    } else if (e.key === 'End') {
      nextIndex = tabs.length - 1;
    } else {
      return;
    }

    e.preventDefault();
    const nextTab = tabs[nextIndex];
    if (nextTab) {
      onChange(nextTab.id);
      const btn = containerRef.current?.querySelector<HTMLButtonElement>(
        `button[data-tab-id="${nextTab.id}"]`
      );
      btn?.focus();
    }
  };

  const sizeClasses = {
    sm: 'text-xs sm:text-sm py-2 px-3 min-h-[38px]',
    md: 'text-xs sm:text-sm py-2 px-3.5 sm:px-4 min-h-[44px]',
    lg: 'text-sm sm:text-base py-2.5 px-5 min-h-[48px]',
  };

  return (
    <div
      ref={containerRef}
      role="tablist"
      aria-label={ariaLabel}
      className={`relative inline-flex items-center p-1 rounded-2xl liquid-segmented-container overflow-x-auto max-w-full scrollbar-none scroll-smooth ${className}`}
      style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
    >
      {/* Smooth Sliding Liquid Indicator */}
      {isReady && indicatorStyle.width > 0 && (
        <div
          className="absolute top-1 bottom-1 rounded-xl bg-white shadow-xs transition-all duration-300 pointer-events-none"
          style={{
            transform: `translateX(${indicatorStyle.left - 4}px)`,
            width: `${indicatorStyle.width}px`,
            transitionTimingFunction: 'cubic-bezier(0.16, 1, 0.3, 1)',
            boxShadow: '0 2px 8px -1px rgba(0,0,0,0.06), 0 1px 2px rgba(0,0,0,0.04), inset 0 1px 0 rgba(255,255,255,1)',
          }}
        />
      )}

      {tabs.map((tab, idx) => {
        const isActive = tab.id === activeId;
        return (
          <button
            key={tab.id}
            role="tab"
            type="button"
            data-tab-id={tab.id}
            id={`tab-${tab.id}`}
            aria-selected={isActive}
            aria-controls={`tabpanel-${tab.id}`}
            tabIndex={isActive ? 0 : -1}
            onClick={() => onChange(tab.id)}
            onKeyDown={(e) => handleKeyDown(e, idx)}
            className={`relative z-10 shrink-0 font-medium transition-colors duration-200 rounded-xl flex items-center gap-1.5 focus:outline-none focus-visible:ring-2 focus-visible:ring-orange-500/50 ${
              sizeClasses[size]
            } ${
              isActive
                ? 'text-neutral-950 font-bold'
                : 'text-neutral-600 hover:text-neutral-900'
            }`}
          >
            <span className="kn">{tab.label}</span>
            {tab.sub && (
              <span className={`text-[10px] hidden md:inline ${isActive ? 'text-orange-700' : 'text-neutral-400'}`}>
                {tab.sub}
              </span>
            )}
            {tab.count !== undefined && (
              <span
                className={`text-[10px] font-mono px-1.5 py-0.2 rounded-full ${
                  isActive
                    ? 'bg-orange-100 text-orange-800'
                    : 'bg-neutral-200/60 text-neutral-600'
                }`}
              >
                {tab.count}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
