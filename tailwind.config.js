/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        primary:   { DEFAULT: '#16294D', hover: '#1E3761', light: '#243F6B' },
        accent:    { DEFAULT: '#F0A500', hover: '#D99200' },   // saffron-gold — action accent
        surface:   '#FFFFFF',
        page:      '#F4F3EF',
        muted:     '#EDEBE5',
        border:    '#DDD9D0',
        tx1:       '#111111',
        tx2:       '#4B4845',
        tx3:       '#8A8580',
        success:   { DEFAULT: '#2F6F5E', bg: '#E4F2EE', border: '#A8D5C9' },
        warning:   { DEFAULT: '#B8862B', bg: '#FDF2DC', border: '#EDD087' },
        error:     { DEFAULT: '#A6362C', bg: '#FAEBE9', border: '#E8AFAA' },
        info:      { DEFAULT: '#2155A3', bg: '#E4EDF9', border: '#A8C2E8' },
        indigo:    { DEFAULT: '#3D3A8C', bg: '#ECEAF8', border: '#B8B4E0' },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['IBM Plex Mono', 'ui-monospace', 'monospace'],
      },
      fontSize: {
        'xs':   ['11px', { lineHeight: '16px' }],
        'sm':   ['13px', { lineHeight: '20px' }],
        'base': ['15px', { lineHeight: '24px' }],
        'md':   ['16px', { lineHeight: '24px' }],
        'lg':   ['18px', { lineHeight: '28px' }],
        'xl':   ['22px', { lineHeight: '30px' }],
        '2xl':  ['28px', { lineHeight: '36px' }],
        '3xl':  ['36px', { lineHeight: '44px' }],
      },
      borderRadius: {
        sm:   '5px',
        DEFAULT: '6px',
        md:   '8px',
        lg:   '10px',
        xl:   '12px',
      },
    },
  },
  plugins: [],
}
