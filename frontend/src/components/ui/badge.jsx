import * as React from 'react'
import { cva } from 'class-variance-authority'

import { cn } from '@/lib/utils'

const badgeVariants = cva(
	'inline-flex items-center rounded-full border border-zinc-200 px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-zinc-950 focus:ring-offset-2 dark:border-zinc-800 dark:focus:ring-zinc-300',
	{
		variants: {
			variant: {
				default:
					'border-transparent bg-zinc-900 text-zinc-50 hover:bg-zinc-900/80 dark:bg-zinc-50 dark:text-zinc-900 dark:hover:bg-zinc-50/80',
				secondary:
					'border-transparent bg-zinc-100 text-zinc-900 hover:bg-zinc-100/80 dark:bg-zinc-800 dark:text-zinc-50 dark:hover:bg-zinc-800/80',
				destructive:
					'border-transparent bg-red-500 text-zinc-50 hover:bg-red-500/80 dark:bg-red-900 dark:text-zinc-50 dark:hover:bg-red-900/80',
				outline: 'text-zinc-950 dark:text-zinc-50',
				'outline-blue': 'text-blue-600 border-blue-600 bg-blue-100',
				'outline-success':
					'text-green-600 border-green-600 bg-green-100',
				'outline-destructive': 'text-red-600 border-red-600 bg-red-100',
				'outline-yellow': 'text-yellow-600 border-yellow-600 bg-yellow-100',
			},
		},
		defaultVariants: {
			variant: 'default',
		},
	},
)

function Badge({ className, variant, ...props }) {
	return (
		<div className={cn(badgeVariants({ variant }), className)} {...props} />
	)
}

export { Badge, badgeVariants }
