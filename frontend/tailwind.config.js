export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#eef2ff',
          100: '#e0e7ff',
          400: '#818cf8',
          500: '#6366f1',
          600: '#4f46e5',
          700: '#4338ca',
        },
        accent: {
          400: '#22d3ee',
          500: '#06b6d4',
        },
      },
      backgroundImage: {
        'brand-gradient': 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 50%, #06b6d4 100%)',
        'brand-gradient-soft': 'linear-gradient(135deg, rgba(99,102,241,0.15) 0%, rgba(139,92,246,0.15) 50%, rgba(6,182,212,0.15) 100%)',
      },
      boxShadow: {
        glow: '0 0 40px -8px rgba(99,102,241,0.45)',
        'glow-sm': '0 0 20px -6px rgba(99,102,241,0.4)',
      },
    },
  },
  plugins: [],
};
