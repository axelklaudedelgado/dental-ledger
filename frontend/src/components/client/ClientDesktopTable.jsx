import { lazy, Suspense } from 'react'
import { Skeleton } from '../ui/skeleton'
import { Card } from '@/components/ui/card'
const DataTable = lazy(() => import('../dataTable/data-table'))

export const ClientDesktopTable = ({ data, status, error, columns, type }) => (
	<Suspense
		fallback={
			<div className="space-y-3 py-4">
				<Card className="p-4">
					<div className="flex justify-between items-center">
						<div className="flex gap-2">
							<Skeleton className="h-10 w-72" />
							<Skeleton className="h-10 w-32" />
						</div>
						<div className="flex gap-2">
							<Skeleton className="h-10 w-20" />
							<Skeleton className="h-10 w-36" />
						</div>
					</div>
				</Card>

				<Card className="p-4 space-y-3">
					<Skeleton className="h-10 w-full" />
					<Skeleton className="h-10 w-full" />
					<Skeleton className="h-10 w-full" />
					<Skeleton className="h-10 w-full" />
					<Skeleton className="h-10 w-full" />
				</Card>
			</div>
		}
	>
		<DataTable
			columns={columns}
			data={data}
			isLoading={status === 'loading'}
			error={status === 'failed' ? error : null}
			type={type}
		/>
	</Suspense>
)
