import { InputWithClear } from '../../ui/extensions/input-with-clear'
import { ClientFilter } from './client-status-filter'

export function Search({ table, clientFilter = false, ...props }) {
	const filterValue = table.getState().globalFilter || ''

	return (
		<div
			className={`flex items-center gap-3 ${clientFilter ? 'w-full' : 'max-w-sm'}`}
		>
			<InputWithClear
				value={filterValue}
				onChange={(event) =>
					table.setGlobalFilter(String(event.target.value))
				}
				className="flex-grow"
				{...props}
			/>
			{clientFilter && (
				<ClientFilter table={table} className="flex-shrink-0" />
			)}
		</div>
	)
}
