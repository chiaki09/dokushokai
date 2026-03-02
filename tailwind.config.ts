import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // Dark campfire theme (room pages)
        'campfire-bg': '#171311',
        'campfire-warm': '#252019',
        'campfire-orange': '#9e7a63',
        'campfire-yellow': '#b8a08a',
        'campfire-ember': '#6e5040',
        'campfire-text': '#d5ccc2',
        // Light lobby theme (home page)
        'lobby-bg': '#faf6f1',
        'lobby-card': '#ffffff',
        'lobby-text': '#3d3029',
        'lobby-muted': '#8a7d72',
        'lobby-border': '#e8ddd0',
        'lobby-accent': '#a07458',
        'lobby-accent-light': '#c49a7c',
        'lobby-hover': '#f3ede6',
      },
      animation: {
        'flame': 'flame 2s ease-in-out infinite alternate',
        'flame-slow': 'flame-slow 3s ease-in-out infinite alternate',
        'in': 'in 0.2s ease-out',
        'fade-in': 'fade-in 0.3s ease-out',
        'slide-in-from-bottom-2': 'slide-in-from-bottom-2 0.3s ease-out',
      },
      keyframes: {
        flame: {
          '0%': { transform: 'scale(1) rotate(-1deg)' },
          '100%': { transform: 'scale(1.05) rotate(1deg)' },
        },
        'flame-slow': {
          '0%': { transform: 'scale(1) rotate(-0.5deg)', opacity: '0.8' },
          '100%': { transform: 'scale(1.03) rotate(0.5deg)', opacity: '1' },
        },
        'in': {
          '0%': { opacity: '0', transform: 'scale(0.95)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        'fade-in': {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        'slide-in-from-bottom-2': {
          '0%': { opacity: '0', transform: 'translateY(8px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        }
      },
      backgroundImage: {},
    },
  },
  plugins: [],
}
export default config