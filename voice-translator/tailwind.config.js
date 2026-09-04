/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#eef2ff',
          100: '#e0e7ff',
          200: '#c7d2fe',
          300: '#a5b4fc',
          400: '#818cf8',
          500: '#6366f1',
          600: '#4f46e5',
          700: '#4338ca',
          800: '#3730a3',
          900: '#312e81',
          950: '#1e1b4b',
        },
        slate: {
          850: '#151e2e',
          925: '#0b0f19',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        display: ['Outfit', 'Inter', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      keyframes: {
        pulseWave: {
          '0%, 100%': { transform: 'scale(1)', opacity: '1' },
          '50%': { transform: 'scale(1.18)', opacity: '0.6' },
        },
        ripple: {
          '0%': { transform: 'scale(0.8)', opacity: '1' },
          '100%': { transform: 'scale(2.2)', opacity: '0' },
        },
        waveBar: {
          '0%, 100%': { height: '8px' },
          '50%': { height: '32px' },
        }
      },
      animation: {
        'pulse-wave': 'pulseWave 1.8s ease-in-out infinite',
        'ripple': 'ripple 1.6s cubic-bezier(0, 0.2, 0.8, 1) infinite',
        'wave-bar-1': 'waveBar 0.9s ease-in-out infinite 0.1s',
        'wave-bar-2': 'waveBar 0.9s ease-in-out infinite 0.3s',
        'wave-bar-3': 'waveBar 0.9s ease-in-out infinite 0.5s',
        'wave-bar-4': 'waveBar 0.9s ease-in-out infinite 0.2s',
        'wave-bar-5': 'waveBar 0.9s ease-in-out infinite 0.4s',
      }
    },
  },
  plugins: [],
}
