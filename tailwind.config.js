/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        sans: ['-apple-system', 'Inter', 'sans-serif'],
        serif: ['Georgia', 'Cambria', 'Times New Roman', 'serif'],
      },
      colors: {
        brand: {
          // Dark surfaces — resolved from CSS vars so they switch with theme
          dark:       'var(--brand-dark)',
          card:       'var(--brand-card)',
          cardHover:  'var(--brand-card-hover)',
          subtle:     'var(--brand-subtle)',
          border:     'var(--brand-border)',
          borderGold: 'rgba(212,160,23,0.25)',
          // Gold stays fixed — same hex in both modes (just opacity varies)
          gold:       '#F3C33F',
          goldLight:  '#F5CC5A',
          goldAccent: '#F7D672',
          goldMuted:  'rgba(243,195,63,0.12)',
          goldDark:   '#C9A227',
        },
      },
    },
  },
  plugins: [],
}
