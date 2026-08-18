/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        bg: {
          primary: '#08111F',
          secondary: '#111C2F',
          card: '#0F1A2E',
        },
        sidebar: '#0B1728',
        accent: {
          cyan: '#12D8FA',
          green: '#2DE37C',
          red: '#FF5B6B',
          yellow: '#FFC857',
          blue: '#4DA6FF',
        },
        text: {
          primary: '#FFFFFF',
          secondary: '#AAB6C8',
          muted: '#5A7089',
        },
        border: {
          subtle: 'rgba(18, 216, 250, 0.12)',
          glow: 'rgba(18, 216, 250, 0.4)',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['IBM Plex Mono', 'monospace'],
      },
      borderRadius: {
        card: '16px',
        btn: '12px',
        dialog: '20px',
      },
      backdropBlur: {
        glass: '20px',
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'glow': 'glow 2s ease-in-out infinite alternate',
        'radar': 'radar 3s linear infinite',
        'packet': 'packet 1.5s ease-in-out infinite',
        'float': 'float 6s ease-in-out infinite',
        'scan': 'scan 2s ease-in-out infinite',
        'counter': 'counter 0.6s ease-out',
      },
      keyframes: {
        glow: {
          '0%': { boxShadow: '0 0 5px rgba(18, 216, 250, 0.3)' },
          '100%': { boxShadow: '0 0 20px rgba(18, 216, 250, 0.8), 0 0 40px rgba(18, 216, 250, 0.4)' },
        },
        radar: {
          '0%': { transform: 'rotate(0deg)' },
          '100%': { transform: 'rotate(360deg)' },
        },
        packet: {
          '0%': { transform: 'translateX(0) translateY(0)', opacity: '1' },
          '100%': { transform: 'translateX(100px) translateY(-50px)', opacity: '0' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        scan: {
          '0%, 100%': { opacity: '0.3' },
          '50%': { opacity: '1' },
        },
      },
      boxShadow: {
        'glass': '0 8px 32px rgba(0, 0, 0, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.05)',
        'neon-cyan': '0 0 15px rgba(18, 216, 250, 0.5)',
        'neon-red': '0 0 15px rgba(255, 91, 107, 0.5)',
        'neon-green': '0 0 15px rgba(45, 227, 124, 0.5)',
        'card-hover': '0 20px 60px rgba(0, 0, 0, 0.6)',
      }
    },
  },
  plugins: [],
}
