/** @type {import('tailwindcss').Config} */
import defaultTheme from 'tailwindcss/defaultTheme'; // Import defaultTheme for fallbacks

export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Based on Medium's common palette
        'black': '#000000', // Medium's core black
        'gray-darker': '#333333', // Dark gray for secondary text/elements
        'gray-dark': '#4A4A4A', // Slightly lighter dark gray
        'gray-medium': '#6E6E6E', // Medium gray for body text
        'gray-light': '#EAEAEA', // Light gray for borders and dividers
        'gray-lighter': '#F9F9F9', // Very light gray background
        'white': '#FFFFFF', // White background

        // Medium's primary accent green (used for links, buttons, etc.)
        'accent-green': '#1A8917',
        // You could add other potential accent colors if needed, e.g.:
        // 'accent-blue': '#1DA1F2',

        // Mapping some common Tailwind color names to the Medium palette for convenience
        // You can adjust these or use the specific names above directly in your classes
        primary: '#FFFFFF', // Often used for primary backgrounds
        secondary: '#000000', // Often used for primary text
        accent: '#1A8917', // Your main accent color
        background: '#F9F9F9', // Overall page background
        text: '#000000', // Default text color
        'text-secondary': '#4A4A4A', // Secondary text color
        border: '#EAEAEA', // Default border color
      },
      fontFamily: {
        // Using the specific font names provided, with standard fallbacks
        sans: [
          'Kievit', // Primary sans-serif (Note: Ensure this font is available/loaded)
          'Marat Sans', // Another sans-serif option
          'Sohne', // Subheading sans-serif, good for general sans too
          'Helvetica Neue',
          'Arial',
          ...defaultTheme.fontFamily.sans, // Include default system sans-serifs as final fallbacks
        ],
        serif: [
          'Charter', // Primary serif (Note: Ensure this font is available/loaded)
          'Noe', // Another serif option
          'Georgia',
          'Cambria',
          'Times New Roman',
          ...defaultTheme.fontFamily.serif, // Include default system serifs as final fallbacks
        ],
        // Specific families for headings if you want to enforce those exact fonts
        heading: [
          'Fell', // Heading font (Note: Ensure this font is available/loaded)
          'Georgia', // Fallback serif for headings
          'Cambria',
          ...defaultTheme.fontFamily.serif,
        ],
        subheading: [
          'Sohne', // Subheading font (Note: Ensure this font is available/loaded)
          'Helvetica Neue', // Fallback for subheadings
          ...defaultTheme.fontFamily.sans,
        ],
        'noe-bold': [
          'Noe Bold',
          'Georgia',
          'Cambria',
          ...defaultTheme.fontFamily.serif
        ],
      },
    },
  },
  plugins: [],
};