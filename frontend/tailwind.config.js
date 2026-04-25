/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      fontFamily: {
        pixel: ['"VT323"', 'monospace'],
        display: ['"Fraunces"', 'Georgia', 'serif'],
        body: ['"Inter"', 'system-ui', 'sans-serif'],
      },
      colors: {
        cream: {
          50:  '#FBF7EF',
          100: '#F5EEDC',
          200: '#EBE0C4',
        },
        moss: {
          400: '#7FA088',
          500: '#5C8268',
          600: '#456350',
          700: '#2F4738',
        },
        peach: {
          400: '#F4A87A',
          500: '#EC8956',
          600: '#D86B3A',
        },
        clay: {
          400: '#D88A7A',
          500: '#C56B5A',
        },
        ink: '#2A2520',
      },
      boxShadow: {
        chunky: '4px 4px 0 0 #2A2520',
        'chunky-sm': '2px 2px 0 0 #2A2520',
      },
      animation: {
        'pet-bob':   'pet-bob 2.4s ease-in-out infinite',
        'pet-sway':  'pet-sway 3.2s ease-in-out infinite',
        'pet-droop': 'pet-droop 4s ease-in-out infinite',
        'sparkle':   'sparkle 1.6s ease-in-out infinite',
        'fade-in':   'fade-in 0.4s ease-out',
      },
      keyframes: {
        'pet-bob':   { '0%,100%': { transform: 'translateY(0)' }, '50%': { transform: 'translateY(-6px)' } },
        'pet-sway':  { '0%,100%': { transform: 'rotate(-2deg)' }, '50%': { transform: 'rotate(2deg)' } },
        'pet-droop': { '0%,100%': { transform: 'translateY(0) rotate(-1deg)' }, '50%': { transform: 'translateY(2px) rotate(1deg)' } },
        'sparkle':   { '0%,100%': { opacity: 0, transform: 'scale(0.6)' }, '50%': { opacity: 1, transform: 'scale(1)' } },
        'fade-in':   { '0%': { opacity: 0, transform: 'translateY(8px)' }, '100%': { opacity: 1, transform: 'translateY(0)' } },
      },
    },
  },
  plugins: [],
};
