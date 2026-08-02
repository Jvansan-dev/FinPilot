export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        // Monocromático puro — sem matiz, só preto/branco/cinza (neutral).
        // brand-600 é o "preto de marca" usado em botões/links no modo claro;
        // brand-400 é o cinza claro usado como acento no modo escuro.
        brand: {
          50: '#fafafa',
          100: '#f4f4f5',
          400: '#d4d4d8',
          500: '#71717a',
          600: '#18181b',
          700: '#09090b',
        },
        accent: {
          400: '#a1a1aa',
          500: '#71717a',
        },
      },
      backgroundImage: {
        'brand-gradient': 'linear-gradient(135deg, #27272a 0%, #18181b 60%, #000000 100%)',
        'brand-gradient-soft': 'linear-gradient(135deg, rgba(24,24,27,0.12) 0%, rgba(24,24,27,0.06) 50%, rgba(0,0,0,0.1) 100%)',
      },
      boxShadow: {
        glow: '0 25px 70px -15px rgba(0,0,0,0.55), 0 0 0 1px rgba(255,255,255,0.05)',
        'glow-sm': '0 10px 30px -10px rgba(0,0,0,0.4), 0 0 0 1px rgba(255,255,255,0.04)',
      },
    },
  },
  plugins: [],
};
