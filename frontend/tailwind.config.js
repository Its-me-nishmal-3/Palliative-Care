/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                glass: "rgba(255, 255, 255, 0.1)",
                brand: {
                    purple: '#6c308b', // Updated to user request
                    blue: '#3052a1',   // New primary blue
                    lavender: '#E8DFF1',
                    'deep-violet': '#3E1C55', // Darker shade of brand.purple
                    teal: '#4FB6A3',
                    palm: '#4C8C4A'
                },
                date: {
                    brown: '#7A3E22',
                    cocoa: '#4A2514',
                    wooden: '#8B5A2B'
                },
                neutral: {
                    grey: '#B9B3C6'
                }
            },
            backdropBlur: {
                xs: '2px',
            }
        },
    },
    plugins: [],
}
