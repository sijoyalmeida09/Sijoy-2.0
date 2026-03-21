import type { Config } from 'tailwindcss'

const config: Config = {
  darkMode: 'class',
  content: ['./src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        // Backgrounds
        primary:      '#000000',
        card:         '#0A0A0A',
        'card-hover': '#1A1A1A',
        surface:      '#1A1A1A',

        // Accent: Crimson Red
        accent:       '#DC2626',
        'accent-light': '#EF4444',
        'accent-green': '#16A34A',

        // Text
        'text-primary':   '#FFFFFF',
        'text-secondary': '#D1D5DB',
        'text-muted':     '#9CA3AF',
      },
      fontFamily: {
        sans: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'sans-serif'],
      },
      borderRadius: {
        'sm': '4px',
        DEFAULT: '8px',
        'md': '8px',
        'lg': '12px',
        'xl': '16px',
        '2xl': '20px',
      },
      animation: {
        'live-pulse':  'livePulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'radar-ping':  'radarPing 2s cubic-bezier(0, 0, 0.2, 1) infinite',
        'fade-in':     'fadeInScale 0.5s cubic-bezier(0.34, 1.56, 0.64, 1)',
        'slide-up':    'slideUp 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)',
        'float':       'floatNote 6s ease-in-out infinite',
        'countdown':   'countdownStroke 60s linear forwards',
        'shimmer':     'shimmer 1.5s infinite',
        'glow-pulse':  'glowPulse 2.5s ease-in-out infinite',
      },
      keyframes: {
        livePulse: {
          '0%, 100%': { opacity: '1', boxShadow: '0 0 0 0 rgba(22,163,74,0.6)' },
          '50%':      { opacity: '0.8', boxShadow: '0 0 0 8px rgba(22,163,74,0)' },
        },
        radarPing: {
          '0%':   { transform: 'scale(0.8)', opacity: '1' },
          '100%': { transform: 'scale(2.5)', opacity: '0' },
        },
        fadeInScale: {
          '0%':   { opacity: '0', transform: 'scale(0.97) translateY(8px)' },
          '100%': { opacity: '1', transform: 'scale(1) translateY(0)' },
        },
        slideUp: {
          '0%':   { opacity: '0', transform: 'translateY(16px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        floatNote: {
          '0%, 100%': { transform: 'translateY(0px) rotate(0deg)', opacity: '0.3' },
          '50%':      { transform: 'translateY(-28px) rotate(8deg)', opacity: '0.6' },
        },
        countdownStroke: {
          '0%':   { strokeDashoffset: '0' },
          '100%': { strokeDashoffset: '283' },
        },
        shimmer: {
          '0%':   { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        glowPulse: {
          '0%, 100%': { boxShadow: '0 0 20px rgba(220,38,38,0.15)' },
          '50%':      { boxShadow: '0 0 35px rgba(220,38,38,0.25)' },
        },
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-dark':   'linear-gradient(135deg, #000000 0%, #0A0A0A 100%)',
        'shimmer-gradient': 'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.04) 50%, transparent 100%)',
      },
      boxShadow: {
        'glow-red':   '0 0 30px rgba(220,38,38,0.25)',
        'glow-green': '0 0 20px rgba(22,163,74,0.3)',
        'card':       'inset 0 0 20px rgba(255,255,255,0.05)',
        'card-hover': 'inset 0 0 30px rgba(255,255,255,0.08), 0 8px 32px rgba(0,0,0,0.5)',
      },
    },
  },
  plugins: [],
}

export default config
