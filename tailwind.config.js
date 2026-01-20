/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                notion: {
                    bg: '#F7F7F5',
                    text: '#37352F',
                    border: '#E9E9E7'
                }
            }
        },
    },
    plugins: [],
}