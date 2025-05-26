/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{html,js,svelte,ts}'],
  theme: {
    extend: {
      colors: {
        'tech-blue': '#0066cc',
        'tech-dark': '#1a1a2e',
        'tech-accent': '#16213e',
        'tech-green': '#00ff88',
        'tech-red': '#ff4757',
        'tech-yellow': '#ffa502',
      },
      fontFamily: {
        'tech': ['Orbitron', 'monospace'],
      }
    },
  },
  plugins: [],
} 