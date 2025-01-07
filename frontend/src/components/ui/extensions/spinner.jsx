import { cn } from '@/lib/utils'
import { Loader2 } from 'lucide-react'

const spinnerVariants = (show) =>
	show ? 'flex flex-col items-center justify-center' : 'hidden'

const loaderVariants = (size) => {
	switch (size) {
		case 'small':
			return 'h-6 w-6'
		case 'large':
			return 'h-12 w-12'
		default:
			return 'h-8 w-8' // default size: medium
	}
}

export function Spinner({ size = 'medium', show = true, children, className }) {
	return (
		<span className={cn(spinnerVariants(show))}>
			<Loader2
				className={cn(
					loaderVariants(size),
					'animate-spin text-primary',
					className,
				)}
			/>
			{children && <span className="mt-2 text-sm">{children}</span>}
		</span>
	)
}
