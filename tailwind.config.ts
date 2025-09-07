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
        // Catppuccin Macchiato palette
        rosewater: '#f4dbd6',
        flamingo: '#f0c6c6',
        pink: '#f5bde6',
        mauve: '#c6a0f6',
        red: '#ed8796',
        maroon: '#ee99a0',
        peach: '#f5a97f',
        yellow: '#eed49f',
        green: '#a6da95',
        teal: '#8bd5ca',
        sky: '#91d7e3',
        sapphire: '#7dc4e4',
        blue: '#8aadf4',
        lavender: '#b7bdf8',
        text: '#cad3f5',
        subtext1: '#b8c0e0',
        subtext0: '#a5adcb',
        overlay2: '#939ab7',
        overlay1: '#8087a2',
        overlay0: '#6e738d',
        surface2: '#5b6078',
        surface1: '#494d64',
        surface0: '#363a4f',
        base: '#24273a',
        mantle: '#1e2030',
        crust: '#181926',
        
        // Semantic colors using Catppuccin
        background: '#24273a', // base
        foreground: '#cad3f5', // text
        card: '#363a4f', // surface0
        'card-foreground': '#cad3f5', // text
        popover: '#363a4f', // surface0
        'popover-foreground': '#cad3f5', // text
        primary: '#8aadf4', // blue
        'primary-foreground': '#24273a', // base
        secondary: '#494d64', // surface1
        'secondary-foreground': '#cad3f5', // text
        muted: '#5b6078', // surface2
        'muted-foreground': '#b8c0e0', // subtext1
        accent: '#c6a0f6', // mauve
        'accent-foreground': '#24273a', // base
        destructive: '#ed8796', // red
        'destructive-foreground': '#f4dbd6', // rosewater
        border: '#6e738d', // overlay0
        input: '#494d64', // surface1
        ring: '#8aadf4', // blue
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
      },
      keyframes: {
        'slide-in-from-right-full': {
          '0%': { transform: 'translateX(100%)' },
          '100%': { transform: 'translateX(0)' },
        },
        'slide-out-to-right-full': {
          '0%': { transform: 'translateX(0)' },
          '100%': { transform: 'translateX(100%)' },
        },
        'fade-in': {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        'scale-in': {
          '0%': { transform: 'scale(0.95)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
      },
      animation: {
        'slide-in-from-right-full': 'slide-in-from-right-full 0.3s ease-out',
        'slide-out-to-right-full': 'slide-out-to-right-full 0.3s ease-in',
        'fade-in': 'fade-in 0.2s ease-out',
        'scale-in': 'scale-in 0.2s ease-out',
        'in': 'fade-in 0.2s ease-out, scale-in 0.2s ease-out',
      },
    },
  },
  plugins: [],
}

export default config