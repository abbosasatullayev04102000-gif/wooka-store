import type { Config } from 'tailwindcss'

/**
 * WOOKA brand system — white surface, purple primary, yellow accent.
 * Values are wired to CSS custom properties in globals.css so the palette can be
 * re-themed at runtime (e.g. from the `settings` table managed by the admin app).
 */
const config: Config = {
  content: ['./src/**/*.{ts,tsx,mdx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#F5F0FF',
          100: '#EDE4FF',
          200: '#DCCBFF',
          300: '#C2A6FF',
          400: '#A275FA',
          500: '#8B4DF5',
          600: '#7C3AED',
          700: '#6C25D9',
          800: '#5A1EB4',
          900: '#4A1B92',
          DEFAULT: '#7C3AED',
        },
        accent: {
          50: '#FFFBEB',
          100: '#FFF4C7',
          200: '#FFE98F',
          300: '#FFDD52',
          400: '#FFD11F',
          500: '#FFC400',
          600: '#E0A800',
          700: '#B58200',
          DEFAULT: '#FFC400',
        },
        ink: {
          DEFAULT: '#151320',
          muted: '#6B6880',
          faint: '#9B98AC',
        },
        surface: {
          DEFAULT: '#FFFFFF',
          soft: '#F7F6FB',
          sunken: '#F0EEF7',
        },
        line: {
          DEFAULT: '#EAE7F2',
          strong: '#DAD5E8',
        },
        danger: '#E3342F',
        success: '#12A150',
      },
      fontFamily: {
        sans: ['var(--font-sans)', 'system-ui', '-apple-system', 'Segoe UI', 'Roboto', 'sans-serif'],
      },
      borderRadius: {
        xl: '0.875rem',
        '2xl': '1.125rem',
        '3xl': '1.5rem',
      },
      boxShadow: {
        card: '0 1px 2px rgba(21,19,32,0.04), 0 4px 16px rgba(21,19,32,0.05)',
        'card-hover': '0 4px 8px rgba(21,19,32,0.06), 0 16px 40px rgba(21,19,32,0.10)',
        pop: '0 12px 48px rgba(21,19,32,0.16)',
      },
      maxWidth: {
        page: '1440px',
      },
      keyframes: {
        'fade-in': { from: { opacity: '0' }, to: { opacity: '1' } },
        'slide-up': { from: { opacity: '0', transform: 'translateY(8px)' }, to: { opacity: '1', transform: 'translateY(0)' } },
        shimmer: { '100%': { transform: 'translateX(100%)' } },
      },
      animation: {
        'fade-in': 'fade-in 180ms ease-out',
        'slide-up': 'slide-up 220ms cubic-bezier(0.22,1,0.36,1)',
        shimmer: 'shimmer 1.6s infinite',
      },
    },
  },
  plugins: [],
}

export default config
