import { Outlet } from 'react-router-dom';

function Wrapper() {
	return (
		<div className="container mx-auto py-10">
			<Outlet /> 
		</div>
	);
}

export default Wrapper;
