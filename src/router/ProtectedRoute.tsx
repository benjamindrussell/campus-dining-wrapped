import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function ProtectedRoute(props: { children: React.ReactNode }) {
	const { isAuthenticated } = useAuth();
	const location = useLocation();
	// Allow bypass for developer testing when mock data is requested
	const allowMock =
		typeof window !== 'undefined' && new URLSearchParams(location.search).get('mock');
	if (allowMock) {
		return <>{props.children}</>;
	}
	if (!isAuthenticated) {
		return <Navigate to="/" replace state={{ from: location }} />;
	}
	return <>{props.children}</>;
}


