/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        surface: {
          base: 'var(--color-surface-base)',
          raised: 'var(--color-surface-raised)',
          overlay: 'var(--color-surface-overlay)',
          inset: 'var(--color-surface-inset)',
          hairline: 'var(--color-surface-hairline)',
        },
        ink: {
          primary: 'var(--color-text-primary)',
          secondary: 'var(--color-text-secondary)',
          muted: 'var(--color-text-muted)',
        },
        brand: {
          emerald: 'var(--color-brand-primary)',
          emeraldDim: 'var(--color-brand-primary-dim)',
          coral: 'var(--color-brand-primary)',
          coralDim: 'var(--color-brand-primary-dim)',
          mint: 'var(--color-brand-primary)',
          mintDark: 'var(--color-brand-primary-dim)',
        },
        ledger: {
          surplus: 'var(--color-ledger-surplus)',
          surplusBg: 'var(--color-ledger-surplus-bg)',
          deficit: 'var(--color-ledger-deficit)',
          deficitBg: 'var(--color-ledger-deficit-bg)',
          neutral: 'var(--color-text-muted)',
        },
        accent: {
          start: 'var(--color-brand-primary-dim)',
          end: 'var(--color-brand-primary)',
        },
        /* Editorial Forest palette — new design layer (additive) */
        ef: {
          'deep-forest': 'var(--ef-deep-forest)',
          'forest-green': 'var(--ef-forest-green)',
          'editorial-green': 'var(--ef-editorial-green)',
          'soft-sage': 'var(--ef-soft-sage)',
          'pale-mint': 'var(--ef-pale-mint)',
          'tulis-lime': 'var(--ef-tulis-lime)',
          'warm-yellow': 'var(--ef-warm-yellow)',
          'golden-yellow': 'var(--ef-golden-yellow)',
          'paper': 'var(--ef-paper)',
          'warm-cream': 'var(--ef-warm-cream)',
          'soft-navy': 'var(--ef-soft-navy)',
          'muted-blue': 'var(--ef-muted-blue)',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        display: ['Inter', 'system-ui', 'sans-serif'],
        numeric: ['JetBrains Mono', 'IBM Plex Mono', 'monospace'],
      },
      boxShadow: {
        paper: '0 4px 20px -2px rgba(0, 0, 0, 0.08), 0 2px 6px -1px rgba(0, 0, 0, 0.04)',
        mint: '0 4px 16px 0 rgba(16, 185, 129, 0.25)',
        subtle: '0 2px 8px 0 rgba(0, 0, 0, 0.06)',
        glass: '0 12px 40px 0 rgba(0, 0, 0, 0.15)',
        card: '0 20px 40px -15px rgba(0, 0, 0, 0.1)',
        /* Editorial Forest shadows */
        'ef-brutalist': 'var(--ef-shadow-brutalist)',
        'ef-brutalist-sm': 'var(--ef-shadow-brutalist-sm)',
      },
    },
  },
  plugins: [],
};


