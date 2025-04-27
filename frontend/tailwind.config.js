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
				border: 'hsl(var(--border))',
				input: 'hsl(var(--input))',
				ring: 'hsl(var(--ring))',
				background: {
					DEFAULT: 'hsl(var(--background))',
					hover: 'hsl(var(--background-hover))',
				},
				foreground: 'hsl(var(--foreground))',
				primary: {
					DEFAULT: 'hsl(var(--primary))',
					foreground: 'hsl(var(--primary-foreground))',
				},
				textPrimary: 'hsl(var(--text-primary))',
				textSecondary: 'hsl(var(--text-secondary))',
				secondary: {
					DEFAULT: 'hsl(var(--secondary))',
					background: 'hsl(var(--secondary-background))',
					foreground: 'hsl(var(--secondary-foreground))',
				},
				edit: {
					DEFAULT: 'hsl(var(--edit))',
				},
				destructive: {
					DEFAULT: 'hsl(var(--destructive))',
					background: 'hsl(var(--destructive-background))',
					foreground: 'hsl(var(--destructive-foreground))',
					focus: 'hsl(var(--destructive-focus))',
				},
				paid: {
					DEFAULT: 'hsl(var(--paid))',
					background: 'hsl(var(--paid-background))',
				},
				partial: {
					DEFAULT: 'hsl(var(--partial))',
					background: 'hsl(var(--partial-background))',
				},
				overpayment: {
					DEFAULT: 'hsl(var(--overpayment))',
				},
				muted: {
					DEFAULT: 'hsl(var(--muted))',
					focus: 'hsl(var(--muted-focus))',
					foreground: 'hsl(var(--muted-foreground))',
				},
				accent: {
					DEFAULT: 'hsl(var(--accent))',
					foreground: 'hsl(var(--accent-foreground))',
				},
				action: {
					DEFAULT: 'hsl(var(--action))',
					focus: 'hsl(var(--action-focus))',
				},
				popover: {
					DEFAULT: 'hsl(var(--popover))',
					foreground: 'hsl(var(--popover-foreground))',
				},
				card: {
					DEFAULT: 'hsl(var(--card))',
					foreground: 'hsl(var(--card-foreground))',
				},
				sidebar: {
					background: 'hsl(var(--sidebar-background))',
					foreground: 'hsl(var(--sidebar-foreground))',
					primary: 'hsl(var(--sidebar-primary))',
					'primary-foreground':
						'hsl(var(--sidebar-primary-foreground))',
					accent: 'hsl(var(--sidebar-accent))',
					'accent-foreground':
						'hsl(var(--sidebar-accent-foreground))',
					border: 'hsl(var(--sidebar-border))',
					ring: 'hsl(var(--sidebar-ring))',
				},
				chart: {
					1: 'hsl(var(--chart-1))',
					2: 'hsl(var(--chart-2))',
					3: 'hsl(var(--chart-3))',
					4: 'hsl(var(--chart-4))',
					5: 'hsl(var(--chart-5))',
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
