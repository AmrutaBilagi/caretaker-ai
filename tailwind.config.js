/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        qc: {
          bg: '#07132B',
          navy: '#0D1B3D',
          cyan: '#4FD1C5',
          emerald: '#10B981',
          light: '#F8FAFC',
          gray: '#94A3B8'
        }
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'hero-glow': 'radial-gradient(circle, rgba(6, 182, 212, 0.15) 0%, rgba(11, 17, 32, 0) 70%)'
      }
    },
  },
  plugins: [],
}
