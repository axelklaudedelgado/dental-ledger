import { DataTable } from './dataTable/data-table'
import { columns } from './dataTable/columns/clientColumns'

export const ClientTable = ({ data, status, error }) => (
	<DataTable
		columns={columns}
		data={data}
		isLoading={status === 'loading'}
		error={status === 'failed' ? error : null}
	/>
)
