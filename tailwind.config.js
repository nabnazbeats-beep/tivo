/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
      },
      colors: {
        tivo: {
          primary: '#0A2540', // Executive Stripe Deep Navy
          accent: '#2563EB',  // Professional Fintech Blue
          // Light Mode tokens
          light: {
            bg: '#F8FAFC',
            card: '#FFFFFF',
            field: '#F1F5F9',
            text: '#0F172A',
            muted: '#64748B',
            border: '#E2E8F0',
          },
          // Dark Mode tokens
          dark: {
            bg: '#090D16',
            card: '#0F172A',
            field: '#1E293B',
            text: '#F8FAFC',
            muted: '#94A3B8',
            border: '#1E293B',
          },
          // Status states
          success: '#16A34A',
          error: '#EF4444',
          warning: '#F59E0B',
          // Network operators (calm, balanced tones)
          network: {
            mtn: '#EAB308',
            moov: '#0284C7',
            celtis: '#10B981',
            smt: '#6366F1',
            other: '#64748B',
          },
        },
        slate: {
          850: '#131D2E',
          750: '#253347',
        },
      },
      backgroundImage: {
        // Signature Royal Blue / Indigo Fintech Gradient (exactement comme le centre de notifications)
        'tivo-gradient': 'linear-gradient(135deg, #1D4ED8 0%, #4338CA 50%, #1E40AF 100%)',
        'tivo-gradient-hover': 'linear-gradient(135deg, #1E40AF 0%, #3730A3 50%, #1E3A8A 100%)',
        'tivo-gradient-subtle': 'linear-gradient(180deg, #F8FAFC 0%, #F1F5F9 100%)',
      },
      boxShadow: {
        // Clean, subtle, professional neutral shadows (no glowing halos)
        'tivo-sm': '0 1px 2px 0 rgba(15, 23, 42, 0.05)',
        'tivo-md': '0 4px 6px -1px rgba(15, 23, 42, 0.06), 0 2px 4px -2px rgba(15, 23, 42, 0.04)',
        'tivo-lg': '0 10px 15px -3px rgba(15, 23, 42, 0.07), 0 4px 6px -4px rgba(15, 23, 42, 0.03)',
        'tivo-glow': 'none',
      },
      keyframes: {
        'tivo-bounce-morph': {
          '0%, 100%': {
            transform: 'translateY(0) scale(1, 1)',
            borderRadius: '6px',
          },
          '50%': {
            transform: 'translateY(-10px) scale(0.9, 1.15)',
            borderRadius: '10px',
          },
        },
      },
      animation: {
        'tivo-square-1': 'tivo-bounce-morph 0.9s cubic-bezier(0.45, 0.05, 0.55, 0.95) infinite',
        'tivo-square-2': 'tivo-bounce-morph 0.9s cubic-bezier(0.45, 0.05, 0.55, 0.95) infinite 0.15s',
        'tivo-square-3': 'tivo-bounce-morph 0.9s cubic-bezier(0.45, 0.05, 0.55, 0.95) infinite 0.3s',
      },
    },
  },
  plugins: [],
};
