import React, { useState } from 'react'
import { Check, X, Filter } from 'lucide-react'

import { Button } from '@/components/ui/button'
import {
	Command,
	CommandEmpty,
	CommandGroup,
	CommandItem,
	CommandList,
} from '@/components/ui/command'
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from '@/components/ui/popover'
import { Checkbox } from '@/components/ui/checkbox'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'

export function ClientFilter({ table }) {
	const [open, setOpen] = useState(false)
	const [selectedValues, setSelectedValues] = useState([])

	const selectedColumn = table.getColumn('status')

	const statuses = ['Paid', 'Unpaid', 'New']

	const handleSelect = (value) => {
		setSelectedValues((prev) => {
			const newSelectedValues = prev.includes(value)
				? prev.filter((item) => item !== value)
				: [...prev, value]

			selectedColumn?.setFilterValue(
				newSelectedValues.length > 0 ? newSelectedValues : undefined,
			)

			return newSelectedValues
		})
	}

	const clearFilters = () => {
		setSelectedValues([])
		selectedColumn?.setFilterValue(undefined)
	}

	const resetCombobox = () => {
		setSelectedValues([])
		setOpen(false)
		selectedColumn?.setFilterValue(undefined)
	}

	return (
		<div className="flex items-center">
			<Popover open={open} onOpenChange={setOpen}>
				<PopoverTrigger asChild>
					<Button
						variant="outline"
						role="combobox"
						aria-expanded={open}
						className="hidden lg:flex items-center px-3 border-dashed"
					>
						<Filter />
						Filter by Status
						{selectedValues.length > 0 && (
							<>
								<Separator
									orientation="vertical"
									className="mx-1 h-4"
								/>
								<div className="flex gap-1 overflow-x-auto">
									{selectedValues.length <= 2 ? (
										selectedValues.map((value) => (
											<Badge
												key={value}
												variant="secondary"
											>
												{value}
											</Badge>
										))
									) : (
										<Badge variant="secondary">
											{selectedValues.length} selected
										</Badge>
									)}
								</div>
							</>
						)}
					</Button>
				</PopoverTrigger>
				<PopoverContent
					align="start"
					className="w-36 p-0"
					sideOffset={4}
				>
					<Command>
						<CommandList>
							<CommandEmpty>No results found.</CommandEmpty>
							<CommandGroup>
								{statuses.map((status) => (
									<CommandItem
										key={status}
										onSelect={() => handleSelect(status)}
									>
										<div className="flex items-center space-x-2 flex-1">
											<Checkbox
												id={`checkbox-${status}`}
												checked={selectedValues.includes(
													status,
												)}
											/>
											<label
												htmlFor={`checkbox-${status}`}
												className="flex-1 cursor-pointer"
												onClick={(e) =>
													e.preventDefault()
												}
											>
												{status}
											</label>
										</div>
										{selectedValues.includes(status) && (
											<Check className="ml-auto h-4 w-4" />
										)}
									</CommandItem>
								))}
							</CommandGroup>
							{selectedValues.length > 0 && (
								<>
									<Separator />
									<CommandItem
										onSelect={clearFilters}
										className="justify-center"
									>
										Clear filters
									</CommandItem>
								</>
							)}
						</CommandList>
					</Command>
				</PopoverContent>
			</Popover>
			{selectedValues.length > 0 && (
				<Button
					variant="ghost"
					size="sm"
					onClick={resetCombobox}
					className="ml-2 px-2"
				>
					Reset
					<X className="ml-2 h-4 w-4" />
				</Button>
			)}
		</div>
	)
}
