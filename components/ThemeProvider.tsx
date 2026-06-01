'use client';

import { useShopStore } from '@/lib/shop-store';
import { useEffect, useState } from 'react';

// Palettes de couleurs premium (version claire)
const PALETTES_LIGHT = {
  nuit: {
    50: '#f5fbfd', 100: '#eef6fb', 200: '#d4e8f2', 300: '#a8c9dd',
    400: '#7aa6c2', 500: '#4f7ea2', 600: '#356486', 700: '#1f4f72',
    800: '#133b57', 900: '#0d2b3f', 950: '#071c28'
  },
  ocean: {
    50: '#f0f9ff', 100: '#e0f2fe', 200: '#bae6fd', 300: '#7dd3fc',
    400: '#38bdf8', 500: '#0ea5e9', 600: '#0284c7', 700: '#0369a1',
    800: '#075985', 900: '#0c4a6e', 950: '#082f49'
  },
  emeraude: {
    50: '#ecfdf5', 100: '#d1fae5', 200: '#a7f3d0', 300: '#6ee7b7',
    400: '#34d399', 500: '#10b981', 600: '#059669', 700: '#047857',
    800: '#065f46', 900: '#064e3b', 950: '#022c22'
  },
  rubis: {
    50: '#fff1f2', 100: '#ffe4e6', 200: '#fecdd3', 300: '#fda4af',
    400: '#fb7185', 500: '#f43f5e', 600: '#e11d48', 700: '#be123c',
    800: '#9f1239', 900: '#881337', 950: '#4c0519'
  },
  or: {
    50: '#fffbeb', 100: '#fef3c7', 200: '#fde68a', 300: '#fcd34d',
    400: '#fbbf24', 500: '#f59e0b', 600: '#d97706', 700: '#b45309',
    800: '#92400e', 900: '#78350f', 950: '#451a03'
  }
};

// Palettes de couleurs pour le mode sombre (version nuit)
const PALETTES_DARK: Record<string, Record<string, string>> = {
  nuit: {
    50: '#0d1b2a', 100: '#1b2838', 200: '#1f3a4f', 300: '#2d4f6e',
    400: '#3d6a8f', 500: '#4f7ea2', 600: '#6a9bc0', 700: '#8fb8d6',
    800: '#b8d4ea', 900: '#dceaf5', 950: '#f0f6fb'
  },
  ocean: {
    50: '#0c1f2e', 100: '#0f2b40', 200: '#0f3b5a', 300: '#0f4f78',
    400: '#0e65a0', 500: '#0ea5e9', 600: '#38bdf8', 700: '#7dd3fc',
    800: '#bae6fd', 900: '#e0f2fe', 950: '#f0f9ff'
  },
  emeraude: {
    50: '#022c22', 100: '#064e3b', 200: '#065f46', 300: '#047857',
    400: '#059669', 500: '#10b981', 600: '#34d399', 700: '#6ee7b7',
    800: '#a7f3d0', 900: '#d1fae5', 950: '#ecfdf5'
  },
  rubis: {
    50: '#4c0519', 100: '#881337', 200: '#9f1239', 300: '#be123c',
    400: '#e11d48', 500: '#f43f5e', 600: '#fb7185', 700: '#fda4af',
    800: '#fecdd3', 900: '#ffe4e6', 950: '#fff1f2'
  },
  or: {
    50: '#451a03', 100: '#78350f', 200: '#92400e', 300: '#b45309',
    400: '#d97706', 500: '#f59e0b', 600: '#fbbf24', 700: '#fcd34d',
    800: '#fde68a', 900: '#fef3c7', 950: '#fffbeb'
  }
};

export default function ThemeProvider() {
  const [mounted, setMounted] = useState(false);
  const theme = useShopStore((state) => state.siteTheme);
  const darkMode = useShopStore((state) => state.darkMode);
  const setDarkMode = useShopStore((state) => state.setDarkMode);

  useEffect(() => {
    setMounted(true);
    // Appliquer la classe dark sur <html> pour Tailwind
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  // Écouter les préférences système
  useEffect(() => {
    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    const handler = (e: MediaQueryListEvent) => {
      // Ne changer que si l'utilisateur n'a pas fait de choix explicite
      const stored = localStorage.getItem('didallah:dark-mode');
      if (stored === null) {
        setDarkMode(e.matches);
      }
    };
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, [setDarkMode]);

  if (!mounted) return null;

  // 1. Gestion des couleurs — choisir la palette selon le mode
  const lightPalette = PALETTES_LIGHT[theme.brandColor as keyof typeof PALETTES_LIGHT] || PALETTES_LIGHT.nuit;
  const darkPalette = PALETTES_DARK[theme.brandColor as keyof typeof PALETTES_DARK] || PALETTES_DARK.nuit;

  let cssVariables = ':root {';
  Object.entries(lightPalette).forEach(([shade, hex]) => {
    cssVariables += `\n  --brand-${shade}: ${hex};`;
  });
  cssVariables += '\n}';

  // Variables pour le mode sombre
  cssVariables += '\n\nhtml.dark {';
  Object.entries(darkPalette).forEach(([shade, hex]) => {
    cssVariables += `\n  --brand-${shade}: ${hex};`;
  });
  cssVariables += '\n}';

  // 2. Gestion des formes (radius)
  let radiusOverrides = '';
  if (theme.radius === 'square') {
    radiusOverrides = `
      .rounded-2xl, .rounded-xl, .rounded-lg, .rounded-md, .rounded {
        border-radius: 0 !important;
      }
    `;
  } else if (theme.radius === 'pill') {
    radiusOverrides = `
      .rounded-2xl, .rounded-xl, .rounded-lg, .rounded-md, .rounded {
        border-radius: 9999px !important;
      }
      img.object-cover { border-radius: 2rem !important; }
    `;
  }

  // 3. Gestion des ombres
  let shadowOverrides = '';
  if (theme.shadows === 'none') {
    shadowOverrides = `
      .shadow-sm, .shadow, .shadow-md, .shadow-lg, .shadow-xl, .shadow-2xl {
        box-shadow: none !important;
      }
    `;
  } else if (theme.shadows === 'deep') {
    shadowOverrides = `
      .shadow-sm, .shadow, .shadow-md, .shadow-lg, .shadow-xl, .shadow-2xl {
        box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25) !important;
      }
    `;
  }

  // 4. Gestion des animations
  let animationOverrides = '';
  if (!theme.animations) {
    animationOverrides = `
      *, *::before, *::after {
        transition-duration: 0s !important;
        animation-duration: 0s !important;
      }
      .group:hover .zoom-hover-img {
        transform: none !important;
      }
    `;
  }

  return (
    <style dangerouslySetInnerHTML={{ __html: `
      /* Variables dynamiques */
      ${cssVariables}
      
      /* Surcharges de Thème (Layout) */
      ${radiusOverrides}
      ${shadowOverrides}
      ${animationOverrides}
    ` }} />
  );
}

