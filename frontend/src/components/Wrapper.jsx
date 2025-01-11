import { Outlet } from 'react-router-dom'
import { Toaster } from './ui/toaster'

function Wrapper() {
	return (
		<div className="container mx-auto py-10">
			<Outlet />
			<Toaster />
		</div>
	)
}

export default Wrapper
