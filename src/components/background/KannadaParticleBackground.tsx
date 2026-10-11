'use client';

import React, { useEffect, useRef } from 'react';

/**
 * Authentic Kannada Varnamale (swaragalu, vyanjanagalu, and selected classical aksharas).
 * No Latin letters, numerals, emojis, or arbitrary symbols.
 */
const KANNADA_GLYPHS: string[] = [
  // Swaragalu (Vowels)
  'ಅ', 'ಆ', 'ಇ', 'ಈ', 'ಉ', 'ಊ', 'ಋ', 'ಎ', 'ಏ', 'ಐ', 'ಒ', 'ಓ', 'ಔ', 'ಅಂ',
  // Vyanjanagalu (Consonants)
  'ಕ', 'ಖ', 'ಗ', 'ಘ', 'ಙ',
  'ಚ', 'ಛ', 'ಜ', 'ಝ', 'ಞ',
  'ಟ', 'ಠ', 'ಡ', 'ಢ', 'ಣ',
  'ತ', 'ಥ', 'ದ', 'ಧ', 'ನ',
  'ಪ', 'ಫ', 'ಬ', 'ಭ', 'ಮ',
  'ಯ', 'ರ', 'ಲ', 'ವ', 'ಶ', 'ಷ', 'ಸ', 'ಹ', 'ಳ',
  // Selected classical aksharas / conjuncts
  'ಜ್ಞ', 'ಶ್ರ', 'ಕ್ಷ'
];

interface Particle {
  char: string;
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  baseOpacity: number;
  opacity: number;
  colorRgb: [number, number, number];
  isBlurred: boolean;
  phase: number;
  driftFreq: number;
}

interface KannadaParticleBackgroundProps {
  className?: string;
  /** Optional density multiplier (defaults to 1.0) */
  densityFactor?: number;
}

export function KannadaParticleBackground({
  className = '',
  densityFactor = 1.0,
}: KannadaParticleBackgroundProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d', { alpha: true });
    if (!ctx) return;

    let animationFrameId: number | null = null;
    let width = 0;
    let height = 0;
    let dpr = 1;
    let particles: Particle[] = [];
    let isReducedMotion = false;
    let isDocumentVisible = !document.hidden;

    // Check prefers-reduced-motion
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    isReducedMotion = mediaQuery.matches;

    const handleMotionChange = (e: MediaQueryListEvent) => {
      isReducedMotion = e.matches;
      if (isReducedMotion) {
        if (animationFrameId) cancelAnimationFrame(animationFrameId);
        animationFrameId = null;
        renderStaticScene();
      } else {
        startAnimation();
      }
    };

    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener('change', handleMotionChange);
    } else {
      mediaQuery.addListener(handleMotionChange);
    }

    // Color choices: pure neutral charcoal, slate, and near-black (strictly monochrome)
    const MONOCHROME_RGB: [number, number, number][] = [
      [15, 23, 42],   // Deep charcoal / near black (#0f172a)
      [31, 41, 55],   // Neutral dark slate (#1f2937)
      [55, 65, 81],   // Mid charcoal (#374151)
      [75, 85, 99],   // Slate grey (#4b5563)
      [107, 114, 128] // Soft grey (#6b7280)
    ];

    /**
     * Initializes particles based on viewport area.
     * Accurately reproduces the visual reference image:
     * - Increased density (~1.8x to 2.2x): ~105-115 on mobile, ~280-320 on desktop
     * - Predominantly tiny glyphs (6-12px) with subtle faint opacities (0.10-0.34)
     * - Stratified jittered distribution to prevent empty patches while keeping natural organic scattering
     * - Monochromatic black, charcoal, and slate grey palette
     */
    const initParticles = () => {
      if (width <= 0 || height <= 0) return;

      const area = width * height;
      // Scaled particle count: ~105 on mobile, ~280-320 on desktop (~2.0x previous density)
      const baseCount = Math.floor(area / 4600);
      const targetCount = Math.min(320, Math.max(105, Math.round(baseCount * densityFactor)));

      // Generate stratified grid coordinates with jitter for even coverage across the viewport
      const aspect = width / height;
      const cols = Math.max(1, Math.round(Math.sqrt(targetCount * aspect)));
      const rows = Math.max(1, Math.ceil(targetCount / cols));
      const cellW = width / cols;
      const cellH = height / rows;

      // Create cell indices and shuffle to assign random layers across the entire screen
      const cellSlots: { c: number; r: number }[] = [];
      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          cellSlots.push({ c, r });
        }
      }
      // Fisher-Yates shuffle
      for (let s = cellSlots.length - 1; s > 0; s--) {
        const j = Math.floor(Math.random() * (s + 1));
        const temp = cellSlots[s];
        cellSlots[s] = cellSlots[j];
        cellSlots[j] = temp;
      }

      particles = [];

      for (let i = 0; i < targetCount; i++) {
        const rand = Math.random();
        let size: number;
        let baseOpacity: number;
        let isBlurred = false;
        let speed: number;
        let rgb: [number, number, number];

        if (rand < 0.42) {
          // Layer 0: Micro ambient & distant faint glyphs (~42% of particles)
          // Tiny (6-10px) with delicate low opacity (0.10-0.22)
          size = 6 + Math.random() * 4; // 6-10px
          baseOpacity = 0.10 + Math.random() * 0.12; // 0.10 - 0.22
          isBlurred = Math.random() < 0.35; // gentle soft bokeh on a portion
          speed = 0.05 + Math.random() * 0.06;
          rgb = Math.random() < 0.5 ? MONOCHROME_RGB[3] : MONOCHROME_RGB[4]; // Slate / Soft grey
        } else if (rand < 0.88) {
          // Layer 1: Midground tiny crisp characters (~46% of particles)
          // Predominantly tiny (7-12px) with crisp, subtle presence (0.16-0.32)
          size = 7 + Math.random() * 5; // 7-12px
          baseOpacity = 0.16 + Math.random() * 0.16; // 0.16 - 0.32
          isBlurred = false;
          speed = 0.07 + Math.random() * 0.08;
          rgb = MONOCHROME_RGB[Math.floor(Math.random() * 3) + 1]; // Dark slate / charcoal
        } else {
          // Layer 2: Foreground subtle accents (~12% of particles)
          // Restrained accent size (11-16px) with distinct contrast (0.26-0.42)
          size = 11 + Math.random() * 5; // 11-16px
          baseOpacity = 0.26 + Math.random() * 0.16; // 0.26 - 0.42
          isBlurred = Math.random() < 0.15;
          speed = 0.09 + Math.random() * 0.09;
          rgb = MONOCHROME_RGB[0]; // Deep charcoal (#0f172a)
        }

        // Drifting vector with random angle
        const angle = Math.random() * Math.PI * 2;
        const vx = Math.cos(angle) * speed;
        const vy = Math.sin(angle) * speed;

        const char = KANNADA_GLYPHS[Math.floor(Math.random() * KANNADA_GLYPHS.length)];

        // Position from stratified jittered cell to prevent clustering / empty patches
        const slot = cellSlots[i % cellSlots.length];
        const posX = (slot.c + 0.1 + Math.random() * 0.8) * cellW;
        const posY = (slot.r + 0.1 + Math.random() * 0.8) * cellH;

        particles.push({
          char,
          x: Math.max(-20, Math.min(width + 20, posX)),
          y: Math.max(-20, Math.min(height + 20, posY)),
          vx,
          vy,
          size,
          baseOpacity,
          opacity: baseOpacity,
          colorRgb: rgb,
          isBlurred,
          phase: Math.random() * Math.PI * 2,
          driftFreq: 0.0004 + Math.random() * 0.0006,
        });
      }
    };

    /**
     * Resizes canvas to fill viewport, accounting for device pixel ratio
     */
    const handleResize = () => {
      width = window.innerWidth;
      height = window.innerHeight;
      dpr = Math.min(window.devicePixelRatio || 1, 2);

      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;

      ctx.scale(dpr, dpr);
      initParticles();

      if (isReducedMotion) {
        renderStaticScene();
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize, { passive: true });

    // Handle document visibility (pause when tab is hidden to conserve CPU/battery)
    const handleVisibilityChange = () => {
      isDocumentVisible = !document.hidden;
      if (isDocumentVisible) {
        if (!animationFrameId && !isReducedMotion) {
          startAnimation();
        }
      } else {
        if (animationFrameId) {
          cancelAnimationFrame(animationFrameId);
          animationFrameId = null;
        }
      }
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);

    const margin = 40;

    /**
     * Renders a single frame.
     * Batches drawing into blurred vs crisp sets to minimize context state switches.
     */
    const renderFrame = (timestamp: number) => {
      ctx.clearRect(0, 0, width, height);

      // Separate particles into blurred batch and crisp batch
      const blurredBatch: Particle[] = [];
      const crispBatch: Particle[] = [];

      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];

        // Animate position if not reduced motion
        if (!isReducedMotion) {
          p.x += p.vx + Math.sin(timestamp * p.driftFreq + p.phase) * 0.08;
          p.y += p.vy + Math.cos(timestamp * p.driftFreq * 0.8 + p.phase) * 0.06;

          // Boundary wrapping
          if (p.x < -margin) p.x = width + margin;
          if (p.x > width + margin) p.x = -margin;
          if (p.y < -margin) p.y = height + margin;
          if (p.y > height + margin) p.y = -margin;

          // Subtle natural breathing in opacity
          p.opacity = p.baseOpacity * (0.92 + 0.08 * Math.sin(timestamp * 0.001 + p.phase));
        }

        if (p.isBlurred) {
          blurredBatch.push(p);
        } else {
          crispBatch.push(p);
        }
      }

      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';

      // 1. Draw blurred batch (single filter switch)
      if (blurredBatch.length > 0) {
        ctx.filter = 'blur(1.5px)';
        for (let j = 0; j < blurredBatch.length; j++) {
          const p = blurredBatch[j];
          ctx.font = `${Math.round(p.size)}px 'Noto Sans Kannada', 'Plus Jakarta Sans', system-ui, sans-serif`;
          ctx.fillStyle = `rgba(${p.colorRgb[0]}, ${p.colorRgb[1]}, ${p.colorRgb[2]}, ${p.opacity.toFixed(3)})`;
          ctx.fillText(p.char, Math.round(p.x), Math.round(p.y));
        }
        ctx.filter = 'none';
      }

      // 2. Draw crisp batch
      for (let k = 0; k < crispBatch.length; k++) {
        const p = crispBatch[k];
        ctx.font = `${Math.round(p.size)}px 'Noto Sans Kannada', 'Plus Jakarta Sans', system-ui, sans-serif`;
        ctx.fillStyle = `rgba(${p.colorRgb[0]}, ${p.colorRgb[1]}, ${p.colorRgb[2]}, ${p.opacity.toFixed(3)})`;
        ctx.fillText(p.char, Math.round(p.x), Math.round(p.y));
      }
    };

    const renderStaticScene = () => {
      renderFrame(0);
    };

    const animate = (timestamp: number) => {
      if (!isDocumentVisible || isReducedMotion) return;
      renderFrame(timestamp);
      animationFrameId = requestAnimationFrame(animate);
    };

    const startAnimation = () => {
      if (animationFrameId) cancelAnimationFrame(animationFrameId);
      animationFrameId = requestAnimationFrame(animate);
    };

    // Ensure Noto Sans Kannada is loaded before initial render to prevent fallback glitches
    if (document.fonts) {
      document.fonts.ready.then(() => {
        if (isReducedMotion) {
          renderStaticScene();
        } else {
          startAnimation();
        }
      });
    } else {
      if (isReducedMotion) {
        renderStaticScene();
      } else {
        startAnimation();
      }
    }

    // Cleanup resources
    return () => {
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
      }
      window.removeEventListener('resize', handleResize);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      if (mediaQuery.removeEventListener) {
        mediaQuery.removeEventListener('change', handleMotionChange);
      } else {
        mediaQuery.removeListener(handleMotionChange);
      }
    };
  }, [densityFactor]);

  return (
    <div
      className={`fixed inset-0 pointer-events-none z-0 overflow-hidden select-none ${className}`}
      aria-hidden="true"
    >
      {/* ─────────────────────────────────────────────────────────────
          1. GLOSSY AMBIENT GRADIENT PATCHES (Restored Design)
             Subtle pastel tones: lavender, cool blue, soft peach, blush pink, honey
             Feathered radial gradients producing organic depth beneath typography
      ───────────────────────────────────────────────────────────── */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden" aria-hidden="true">
        {/* Soft morning amber / peach glow (top-left) */}
        <div
          className="aurora-live-1 absolute -top-[15%] left-[6%] w-[700px] h-[700px] rounded-full blur-[100px] opacity-60"
          style={{
            background:
              'radial-gradient(circle, rgba(255, 195, 145, 0.45) 0%, rgba(254, 215, 170, 0.28) 45%, transparent 75%)',
          }}
        />

        {/* Delicate blush dawn glow (top-right / middle) */}
        <div
          className="aurora-live-2 absolute top-[15%] -right-[8%] w-[720px] h-[720px] rounded-full blur-[115px] opacity-55"
          style={{
            background:
              'radial-gradient(circle, rgba(254, 205, 211, 0.45) 0%, rgba(253, 186, 116, 0.22) 45%, transparent 75%)',
          }}
        />

        {/* Cool subtle sky blue mist (center / navigation zone) */}
        <div
          className="aurora-live-3 absolute top-[32%] left-[18%] w-[620px] h-[620px] rounded-full blur-[120px] opacity-40"
          style={{
            background:
              'radial-gradient(circle, rgba(219, 234, 254, 0.45) 0%, rgba(191, 219, 254, 0.22) 48%, transparent 75%)',
          }}
        />

        {/* Honey sunlight base (mid-lower left) */}
        <div
          className="aurora-live-3 absolute top-[55%] -left-[14%] w-[650px] h-[650px] rounded-full blur-[110px] opacity-45"
          style={{
            background:
              'radial-gradient(circle, rgba(254, 240, 138, 0.38) 0%, rgba(254, 215, 170, 0.20) 50%, transparent 70%)',
          }}
        />

        {/* Subtle bottom lavender warmth (bottom-right) */}
        <div
          className="aurora-live-1 absolute -bottom-[10%] right-[12%] w-[660px] h-[660px] rounded-full blur-[105px] opacity-45"
          style={{
            background:
              'radial-gradient(circle, rgba(243, 232, 255, 0.45) 0%, rgba(233, 213, 255, 0.25) 50%, transparent 75%)',
          }}
        />

        {/* Ultra-subtle paper grain texture overlay for tactile Notion / iOS feel */}
        <div
          className="absolute inset-0 opacity-[0.022]"
          style={{
            backgroundImage: `radial-gradient(#000 1px, transparent 1px)`,
            backgroundSize: '24px 24px',
          }}
        />
      </div>

      {/* ─────────────────────────────────────────────────────────────
          2. LIVE ANIMATED KANNADA TYPOGRAPHY CANVAS
             Preserved particle density (~281 desktop / ~105 mobile),
             predominantly tiny glyphs (6-12px) floating smoothly over gradients
      ───────────────────────────────────────────────────────────── */}
      <canvas
        ref={canvasRef}
        className="relative z-10 w-full h-full block pointer-events-none"
        aria-hidden="true"
      />
    </div>
  );
}
