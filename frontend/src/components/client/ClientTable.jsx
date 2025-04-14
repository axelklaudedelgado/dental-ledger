import { useMediaQuery } from '../ui/hooks/useMediaQuery'
import { clientColumns } from '../dataTable/columns/clientColumns'
import { ClientsCardView } from './ClientCardView'
import { ClientDesktopTable } from './ClientDesktopTable'

export const ClientTable = ({ data, status, error }) => {
	const isMobile = useMediaQuery('(max-width: 768px)')

	if (isMobile) {
		return <ClientsCardView data={data} status={status} error={error} />
	}

	return (
		<ClientDesktopTable
			data={data}
			status={status}
			error={error}
			columns={clientColumns}
			type="client"
		/>
	)
}
