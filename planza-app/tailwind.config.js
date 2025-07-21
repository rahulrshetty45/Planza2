/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // Exact colors from Figma design
        'planza-bg': 'rgb(242, 246, 249)', // Background color from Figma
        'planza-gray': 'rgb(85, 85, 85)', // Text color from Figma
        'planza-border': 'rgb(238, 238, 238)', // Border color from Figma
        'planza-blue': 'rgb(79, 172, 254)', // Blue accent
        'planza-green': 'rgb(34, 197, 94)', // Success green
        'planza-orange': 'rgb(251, 146, 60)', // Warning orange
      },
      fontFamily: {
        'satoshi': ['Satoshi', 'system-ui', 'sans-serif'], // Primary font from Figma
      },
      fontSize: {
        'figma-14': ['14px', { lineHeight: '14px' }], // Exact font size from Figma
      },
      spacing: {
        '7px': '7px', // Exact padding from Figma
        '6px': '6px', // Exact spacing from Figma
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic': 'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
      },
      borderRadius: {
        'figma': '4px', // Exact corner radius from Figma
      },
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
  ],
} 