import { Outlet, useLocation, useParams, Link } from 'react-router-dom'
import decodeClientSlug from '../utils/decodeClientSlug'
import { Toaster } from './ui/toaster'
import BackButton from './BackButton'
import {
	Breadcrumb,
	BreadcrumbItem,
	BreadcrumbLink,
	BreadcrumbList,
	BreadcrumbSeparator,
} from './ui/breadcrumb'
import React from 'react'

function Wrapper() {
	const location = useLocation()
	const params = useParams()
	const pathname = location.pathname

	const routeHeaderMap = [
		{
			pattern: (path) => path === '/',
			header: () => (
				<h1 className="text-xl md:text-2xl font-bold tracking-tight">
					Clients List
				</h1>
			),
			breadcrumbItems: () => [],
		},
		{
			pattern: (path) => /^\/client\/[^/]+$/.test(path),
			header: () => (
				<h1 className="text-xl md:text-2xl font-bold tracking-tight">
					Transactions for {decodeClientSlug(params.slugName, true)}
				</h1>
			),
			backButton: () => (
				<BackButton navigateRoute={'/'} refreshClients={true} />
			),
			breadcrumbItems: () => [
				{ label: 'Clients', to: '/' },
				{ label: decodeClientSlug(params.slugName, true) },
			],
		},
		{
			pattern: (path) => /^\/client\/[^/]+\/transaction\/add$/.test(path),
			header: () => (
				<h1 className="text-xl md:text-2xl font-bold tracking-tight">
					Add New Transaction
				</h1>
			),
			backButton: () => (
				<BackButton
					navigateRoute={location.pathname.replace(
						'/transaction/add',
						'',
					)}
					preserveState={false}
					clearSessionStorage={true}
				/>
			),
			breadcrumbItems: () => [
				{ label: 'Clients', to: '/' },
				{
					label: decodeClientSlug(params.slugName, true),
					to: params.slugName ? `/client/${params.slugName}` : '/',
				},
				{ label: 'Add Transaction' },
			],
		},
		{
			pattern: (path) =>
				/^\/client\/[^/]+\/transaction\/edit$/.test(path),
			header: () => (
				<h1 className="text-xl md:text-2xl font-bold tracking-tight">
					Edit Transaction
				</h1>
			),
			backButton: () => (
				<BackButton
					navigateRoute={location.pathname.replace(
						'/transaction/edit',
						'',
					)}
					preserveState={false}
					clearSessionStorage={true}
				/>
			),
			breadcrumbItems: () => [
				{ label: 'Clients', to: '/' },
				{
					label: decodeClientSlug(params.slugName, true),
					to: params.slugName ? `/client/${params.slugName}` : '/',
				},
				{ label: 'Edit Transaction' },
			],
		},
		{
			pattern: (path) =>
				/^\/client\/[^/]+\/transaction\/edit\/review$/.test(path),
			header: () => (
				<h1 className="text-xl md:text-2xl font-bold tracking-tight">
					Review Changes
				</h1>
			),
			breadcrumbItems: () => [
				{ label: 'Clients', to: '/' },
				{
					label: decodeClientSlug(params.slugName, true),
					to: params.slugName ? `/client/${params.slugName}` : '/',
				},
				{
					label: 'Edit Transaction',
					to: location.pathname.replace('/review', ''),
				},
				{ label: 'Review Changes' },
			],
		},
	]

	const renderHeader = () => {
		const match = routeHeaderMap.find((route) => route.pattern(pathname))
		if (!match) return null

		return (
			<div className="flex items-center gap-2">
				{match.backButton && match.backButton()}
				{match.header()}
			</div>
		)
	}

	const renderBreadcrumbs = () => {
		const match = routeHeaderMap.find((route) => route.pattern(pathname))
		if (!match || !match.breadcrumbItems) return null

		const items = match.breadcrumbItems()

		if (!items || items.length === 0) return null

		return (
			<Breadcrumb className="my-5">
				<BreadcrumbList>
					{items.map((item, index) => (
						<React.Fragment key={index}>
							{index > 0 && <BreadcrumbSeparator />}
							<BreadcrumbItem>
								{item.to ? (
									<BreadcrumbLink asChild>
										<Link to={item.to}>{item.label}</Link>
									</BreadcrumbLink>
								) : (
									<BreadcrumbLink>
										{item.label}
									</BreadcrumbLink>
								)}
							</BreadcrumbItem>
						</React.Fragment>
					))}
				</BreadcrumbList>
			</Breadcrumb>
		)
	}

	return (
		<div className="container mx-auto py-6 max-w-7xl px-4 md:px-6 lg:px-8">
			<header>{renderHeader()}</header>
			{renderBreadcrumbs()}
			<main>
				<Outlet />
				<Toaster />
			</main>
			<footer>{/* None for now */}</footer>
		</div>
	)
}

export default Wrapper
