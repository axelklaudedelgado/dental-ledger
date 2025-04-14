import { useState, useEffect } from 'react'
import { Spinner } from '../ui/extensions/spinner'

export const ClientDesktopTable = ({ data, status, error, columns, type }) => {
	const [DataTable, setDataTable] = useState(null)
	const [isLoading, setIsLoading] = useState(true)

	useEffect(() => {
		import('../dataTable/data-table')
			.then((module) => {
				setDataTable(() => module.DataTable)
				setIsLoading(false)
			})
			.catch((error) => {
				console.error('Failed to load DataTable:', error)
				setIsLoading(false)
			})
	}, [])

	if (isLoading) {
		return <Spinner size="small">Loading data...</Spinner>
	}

	if (!DataTable) {
		return <div>Could not load data table component.</div>
	}

	return (
		<DataTable
			columns={columns}
			data={data}
			isLoading={status === 'loading'}
			error={status === 'failed' ? error : null}
			type={type}
		/>
	)
}
