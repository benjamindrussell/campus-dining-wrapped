import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function ProtectedRoute(props: { children: React.ReactNode }) {
	const { isAuthenticated } = useAuth();
	const location = useLocation();
	if (!isAuthenticated) {
		return <Navigate to="/" replace state={{ from: location }} />;
	}
	return <>{props.children}</>;
}


