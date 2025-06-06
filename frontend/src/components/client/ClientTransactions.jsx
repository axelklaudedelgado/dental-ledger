import { useParams } from 'react-router-dom'
import { useEffect } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { fetchClientDetails } from '../../reducers/clientSlice'
import { lazy, Suspense } from 'react'
import { Skeleton } from '../ui/skeleton'
import { TransactionTable } from '../transaction/TransactionTable'
import {
	Card,
	CardTitle,
	CardDescription,
	CardContent,
	CardHeader,
	CardFooter,
} from '../ui/card'
import { Separator } from '../ui/separator'
import { Badge } from '../ui/badge'
import decodeClientSlug from '../../utils/decodeClientSlug'

const AccountCard = ({ selectedClient }) => (
	<Card>
		<CardHeader>
			<CardTitle className="text-xl md:text-2xl">
				Statement of Account
			</CardTitle>
			<CardDescription className="text-textSecondary">
				Account details and transaction summary
			</CardDescription>
		</CardHeader>
		<CardContent className="space-y-4">
			<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
				<div className="space-y-2">
					<div className="text-sm text-textSecondary">Name</div>
					<div className="font-medium">
						{selectedClient?.fullName}
					</div>
				</div>
				<div className="space-y-2">
					<div className="text-sm text-textSecondary">Address</div>
					<div className="font-medium">{selectedClient?.address}</div>
				</div>
			</div>
			<Separator />
			<div className="flex justify-between items-center">
				<div className="text-sm text-textSecondary">
					Grand Total / Remaining Balance
				</div>
				<div className="text-xl lg:text-2xl font-bold">
					{new Intl.NumberFormat('en-PH', {
						style: 'currency',
						currency: 'PHP',
					}).format(selectedClient?.totalBalance)}
				</div>
			</div>
		</CardContent>
		<CardFooter className="flex justify-between">
			<div className="text-sm text-textSecondary">
				Last Transaction Date:{' '}
				{selectedClient?.lastTransactionDate
					? new Date(
							selectedClient.lastTransactionDate,
						).toLocaleDateString('en-US', {
							year: 'numeric',
							month: 'long',
							day: 'numeric',
						})
					: 'No transactions'}
			</div>
			<Badge
				variant={
					selectedClient?.status === 'Paid'
						? 'outline-success'
						: selectedClient?.status === 'Unpaid'
							? 'outline-destructive'
							: 'outline-blue'
				}
			>
				{selectedClient?.status}
			</Badge>
		</CardFooter>
	</Card>
)

const AccountCardSkeleton = () => (
	<Card>
		<CardHeader>
			<Skeleton className="h-8 w-3/4" />
			<Skeleton className="h-4 w-1/2 mt-2" />
		</CardHeader>
		<CardContent className="space-y-4">
			<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
				<div className="space-y-2">
					<Skeleton className="h-4 w-16" />
					<Skeleton className="h-6 w-full" />
				</div>
				<div className="space-y-2">
					<Skeleton className="h-4 w-16" />
					<Skeleton className="h-6 w-full" />
				</div>
			</div>
			<Separator />
			<div className="flex justify-between items-center">
				<Skeleton className="h-4 w-48" />
				<Skeleton className="h-8 w-32" />
			</div>
		</CardContent>
		<CardFooter className="flex justify-between">
			<Skeleton className="h-4 w-56" />
			<Skeleton className="h-6 w-20" />
		</CardFooter>
	</Card>
)

export const ClientTransactions = () => {
	const { slugName } = useParams()
	const id = decodeClientSlug(slugName)
	const dispatch = useDispatch()

	const { selectedClient, clientDetailsStatus, clientDetailsError } =
		useSelector((state) => state.clients)

	useEffect(() => {
		dispatch(fetchClientDetails(id))
	}, [id, dispatch])

	return (
		<div>
			<Suspense fallback={<AccountCardSkeleton />}>
				{clientDetailsStatus === 'loading' ? (
					<AccountCardSkeleton />
				) : (
					<AccountCard selectedClient={selectedClient} />
				)}
			</Suspense>

			<TransactionTable
				data={selectedClient ? selectedClient.transactions : []}
				status={clientDetailsStatus}
				error={clientDetailsError}
			/>
		</div>
	)
}
