/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{astro,html,js,jsx,ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        mono: ['"IBM Plex Mono"', 'monospace'],
        sans: ['"Inter"', 'sans-serif'],
      },
      colors: {
        cyber: {
          dark: '#0a0a0f',
          darker: '#050508',
          purple: '#b026ff',
          blue: '#00d4ff',
          red: '#ff2d55',
          green: '#00ff88',
        },
      },
      animation: {
        'glow-pulse': 'glow-pulse 2s ease-in-out infinite alternate',
        'float': 'float 3s ease-in-out infinite',
      },
      keyframes: {
        'glow-pulse': {
          '0%': { boxShadow: '0 0 5px currentColor, 0 0 10px currentColor' },
          '100%': { boxShadow: '0 0 20px currentColor, 0 0 40px currentColor, 0 0 60px currentColor' },
        },
        'float': {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
        },
      },
    },
  },
  plugins: [],
};
