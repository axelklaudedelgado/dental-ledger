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
			keyframes: {
				'accordion-down': {
					from: {
						height: '0',
					},
					to: {
						height: 'var(--radix-accordion-content-height)',
					},
				},
				'accordion-up': {
					from: {
						height: 'var(--radix-accordion-content-height)',
					},
					to: {
						height: '0',
					},
				},
			},
			animation: {
				'accordion-down': 'accordion-down 0.2s ease-out',
				'accordion-up': 'accordion-up 0.2s ease-out',
			},
		},
	},
	plugins: [tailwindcssAnimate],
}
