import tailwindcssAnimate from 'tailwindcss-animate'

/** @type {import('tailwindcss').Config} */
export default {
	darkMode: ['class'],
	content: ['./index.html', './src/**/*.{js,jsx}'],
	theme: {
		extend: {
			borderRadius: {
				lg: 'var(--radius)',
				md: 'calc(var(--radius) - 2px)',
				sm: 'calc(var(--radius) - 4px)',
			},
			colors: {
				muted: {
					DEFAULT: 'hsl(var(--muted))',
					foreground: 'hsl(var(--scn-muted-foreground))',
				},
			},
		},
	},
	plugins: [tailwindcssAnimate],
}
