import * as React from 'react'
import { Button } from '../button'
import { Input } from '../input'
import { X } from 'lucide-react'

const InputWithClear = React.forwardRef(
	({ value, onChange, className, ...props }, ref) => {
		const handleClear = () => {
			if (onChange) {
				onChange({ target: { value: '' } })
			}
		}

		return (
			<div className="relative w-72">
				<Input
					value={value}
					onChange={onChange}
					className={className}
					ref={ref}
					{...props}
				/>
				{value && (
					<Button
						type="button"
						variant="ghost"
						size="icon"
						className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
						onClick={handleClear}
						aria-label="Clear input"
					>
						<X className="h-4 w-4" />
					</Button>
				)}
			</div>
		)
	},
)
InputWithClear.displayName = 'Input'

export { InputWithClear }
