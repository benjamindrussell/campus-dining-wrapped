import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import logo from '../assets/logo.png';

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

	return (
		<div className="min-h-screen w-full bg-sky-400 flex justify-center">
			<main className="w-full max-w-[430px] min-h-screen p-4 flex flex-col">
				<div className="flex flex-1 items-center justify-center">
					{working ? (
						<div className="flex flex-col items-center text-center space-y-4">
							<div className="relative h-28 w-28">
								<div className="absolute inset-0 -m-1 rounded-full border-4 border-white/30 border-t-red-500 animate-spin" />
								<div className="absolute inset-0 flex items-center justify-center">
									<img src={logo} alt="UDayton Meal Plan Wrapped logo" className="w-28 h-28" />
								</div>
							</div>
							<p className="text-white font-semibold">Setting up your device…</p>
							<p className="text-white/85 text-sm">This should only take a few seconds.</p>
						</div>
					) : error ? (
						<div className="mx-auto max-w-[380px] rounded-xl border border-white/25 bg-white/10 px-4 py-4 text-white">
							<p className="font-semibold text-white">{error}</p>
							<button className="underline mt-2 font-semibold hover:text-white/90" onClick={() => navigate('/')}>
								Back
							</button>
						</div>
					) : (
						<p className="text-white">Ready.</p>
					)}
				</div>
			</main>
		</div>
	);
}


