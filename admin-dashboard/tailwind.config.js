/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                brand: {
                    50: '#FDF8F6',
                    100: '#F2E8E5',
                    200: '#EADDD7',
                    300: '#E0CEC7',
                    400: '#D2BAB0',
                    500: '#A18072', // Warm Earthy Brown (Primary)
                    600: '#846358',
                    700: '#674D43',
                    800: '#4A3730',
                    900: '#2D211D',
                },
                accent: {
                    50: '#F4F7F5',
                    100: '#E3EBE5',
                    500: '#8DA399', // Muted Sage Green
                    600: '#6B8276',
                },
                // Adding a specific 'cream' background color if needed
                surface: '#FDFBF7'
            },
            fontFamily: {
                sans: ['Inter', 'sans-serif'],
            }
        },
    },
    plugins: [],
}
