import { DataTable } from './dataTable/data-table'
import { transactionColumns } from './dataTable/columns/transactionColumns'

export const TransactionTable = ({ data, status, error }) => (
	<DataTable
		columns={transactionColumns}
		data={data}
		isLoading={status === 'loading'}
		error={status === 'failed' ? error : null}
		type={'transaction'}
	/>
)
