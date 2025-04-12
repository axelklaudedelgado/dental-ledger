import { useMediaQuery } from './ui/hooks/useMediaQuery'
import { transactionColumns } from './dataTable/columns/transactionColumns'
import { TransactionAccordionView } from './TransactionAccordionView'
import { TransactionDesktopTable } from './TransactionDesktopTable'

export const TransactionTable = ({ data, status, error }) => {
	const isMobile = useMediaQuery('(max-width: 768px)')

	if (isMobile) {
		return (
			<TransactionAccordionView
				transactions={data}
				status={status}
				error={error}
			/>
		)
	}

	return (
		<TransactionDesktopTable
			data={data}
			status={status}
			error={error}
			columns={transactionColumns}
			type="transaction"
		/>
	)
}
