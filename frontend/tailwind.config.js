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
        dark: {
          bg: 'rgb(var(--bg-rgb, 11 15 25) / <alpha-value>)',
          secondary: 'rgb(var(--secondary-rgb, 17 24 39) / <alpha-value>)',
          card: 'rgb(var(--card-rgb, 22 31 48) / <alpha-value>)',
          border: 'rgb(var(--border-rgb, 31 41 61) / <alpha-value>)',
          hover: 'rgb(var(--hover-rgb, 34 47 70) / <alpha-value>)',
        },
        primary: {
          DEFAULT: 'rgb(var(--primary-rgb, 139 92 246) / <alpha-value>)',
          hover: 'rgb(var(--primary-hover-rgb, 124 58 237) / <alpha-value>)',
          light: 'rgb(var(--primary-light-rgb, 167 139 250) / <alpha-value>)',
          glow: 'var(--color-primary-glow, rgba(139, 92, 246, 0.35))',
        },
        accent: {
          DEFAULT: 'rgb(var(--accent-rgb, 6 182 212) / <alpha-value>)',
          hover: 'rgb(var(--accent-hover-rgb, 8 145 178) / <alpha-value>)',
          light: 'rgb(var(--accent-light-rgb, 103 232 249) / <alpha-value>)',
          glow: 'var(--color-accent-glow, rgba(6, 182, 212, 0.35))',
        },
        cyber: {
          green: 'rgb(var(--cyber-green-rgb, 16 185 129) / <alpha-value>)',
          red: 'rgb(var(--cyber-red-rgb, 239 68 68) / <alpha-value>)',
          amber: 'rgb(var(--cyber-amber-rgb, 245 158 11) / <alpha-value>)',
          blue: 'rgb(var(--cyber-blue-rgb, 59 130 246) / <alpha-value>)',
        }
      },
      fontFamily: {
        sans: 'var(--font-family, Inter, system-ui, -apple-system, sans-serif)',
        mono: 'var(--font-mono, "JetBrains Mono", "Fira Code", monospace)'
      },
      boxShadow: {
        'glow-primary': '0 0 25px -5px var(--color-primary-glow, rgba(139, 92, 246, 0.4))',
        'glow-accent': '0 0 25px -5px var(--color-accent-glow, rgba(6, 182, 212, 0.4))',
        'glow-card': '0 4px 20px -2px rgba(0, 0, 0, 0.5), 0 0 15px -3px var(--color-primary-glow, rgba(139, 92, 246, 0.15))',
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'wave': 'wave 1.2s ease-in-out infinite',
      },
      keyframes: {
        wave: {
          '0%, 100%': { height: '20%' },
          '50%': { height: '100%' },
        }
      }
    },
  },
  plugins: [],
}
