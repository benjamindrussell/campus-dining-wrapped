import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Capture() {
	const { createCredentialsWithValidatorSession, isAuthenticated } = useAuth();
	const navigate = useNavigate();
	const location = useLocation();
	const [error, setError] = useState<string | null>(null);
	const [working, setWorking] = useState(false);

	useEffect(() => {
		const params = new URLSearchParams(location.search);
		const sessionId = params.get('sessionId');
		if (!sessionId) {
			setError('Missing sessionId in URL.');
			return;
		}
		if (isAuthenticated) {
			// Already have credentials, go to wrapped
			navigate('/wrapped', { replace: true });
			return;
		}
		setWorking(true);
		createCredentialsWithValidatorSession(sessionId)
			.then(() => navigate('/wrapped', { replace: true }))
			.catch((e) => {
				console.error(e);
				setError('Failed to create credentials. Please try again.');
			})
			.finally(() => setWorking(false));
	}, [location.search, createCredentialsWithValidatorSession, isAuthenticated, navigate]);

	if (working) {
		return <div className="p-4">Setting up your device…</div>;
	}

	if (error) {
		return (
			<div className="p-4">
				<p className="text-red-600">{error}</p>
				<button className="underline mt-2" onClick={() => navigate('/')}>
					Back
				</button>
			</div>
		);
	}

	return <div className="p-4">Ready.</div>;
}


