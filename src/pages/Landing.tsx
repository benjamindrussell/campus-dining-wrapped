import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Onboarding from '../components/Onboarding';
import { Github } from 'lucide-react';

export default function Landing() {
	const { isAuthenticated } = useAuth();
	const navigate = useNavigate();
	// Keep for future use if needed
	useMemo(() => 'https://get.cbord.com/udayton/full/login.php?mobileapp=1', []);

	if (isAuthenticated) {
		// If already have deviceId + pin, send to wrapped
		return (
			<div className="p-4">
				<p>You are already set up. Continue to your wrapped.</p>
				<button onClick={() => navigate('/wrapped')} className="mt-2 underline">
					Go to wrapped
				</button>
			</div>
		);
	}

	return (
		<div className="min-h-screen w-full bg-sky-400 flex justify-center">
			<main className="w-full max-w-[430px] min-h-screen p-4 flex flex-col">
				<div className="flex flex-col items-center text-center space-y-2">
					<span className="font-bold italic text-white text-lg">You survived another semester...</span>
					<h1 className="text-red-600 font-extrabold text-6xl leading-tight outline-white-2">
						UDayton
						<br />
						Meal Plan
						<br />
						Wrapped
					</h1>
					<p className="font-semibold italic max-w-[320px] text-white leading-relaxed">
						Where did you eat? How much did you spend? When did you eat? How much 💸 did your plan save you… or lose you?
					</p>
					<Onboarding />
				</div>
				<footer className="mt-auto pt-8 text-xs text-white/85">
					<div className="mx-auto max-w-[380px] rounded-xl border border-white/25 bg-white/10 px-4 py-4 space-y-3">
						<p className="leading-relaxed">
							🔒 This project works with <span className="font-semibold text-white">your dining data</span>. That's sensitive information, and you
							should always be curious about how your data is accessed, processed, and stored.
						</p>
						<div className="pt-1">
							<a href="/privacy" className="inline-flex items-center gap-1 font-semibold underline underline-offset-2 hover:text-white">
								Learn exactly how your data is handled →
							</a>
						</div>
					</div>
					<div className="mt-4 flex items-center justify-center gap-2 text-white">
						<a
							href="https://github.com/benjamindrussell/campus-dining-wrapped"
							target="_blank"
							rel="noreferrer"
							className="flex items-center gap-1 underline font-semibold underline-offset-2 hover:text-white/90"
						>
							<Github className="w-4 h-4" /> View source
						</a>
						<span className="text-white font-bold">·</span>
						<p>
							Built by{' '}
							<a href="https://benrussell.tech" target="_blank" rel="noreferrer" className="font-semibold text-white underline underline-offset-2 hover:text-white/90">
								Ben Russell
							</a>
						</p>
					</div>
				</footer>
			</main>
		</div>
	);
}


