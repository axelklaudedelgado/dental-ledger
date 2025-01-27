import { DataTable } from './dataTable/data-table'
import { clientColumns } from './dataTable/columns/clientColumns'

export const ClientTable = ({ data, status, error }) => (
	<DataTable
		columns={clientColumns}
		data={data}
		isLoading={status === 'loading'}
		error={status === 'failed' ? error : null}
		type="client"
	/>
)
