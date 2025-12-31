import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Onboarding from '../components/Onboarding';
import { Github } from 'lucide-react';

export default function Landing() {
	const { isAuthenticated, clearCredentials } = useAuth();
	const navigate = useNavigate();
	// Keep for future use if needed
	useMemo(() => 'https://get.cbord.com/udayton/full/login.php?mobileapp=1', []);

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
				</div>
				{isAuthenticated ? (
					<div className="mt-6 flex items-center justify-center">
						<div className="max-w-[400px] w-full text-center">
							<div className="flex flex-col items-stretch justify-center gap-2 w-full max-w-[320px] mx-auto">
								<button
									onClick={() => navigate('/wrapped')}
									className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700 cursor-pointer"
								>
									View your Wrapped
								</button>
								<button
									onClick={() => {
										clearCredentials();
										navigate('/');
									}}
									className="inline-flex items-center justify-center gap-2 self-center rounded-lg bg-white px-4 py-2 text-sm font-semibold text-gray-800 hover:bg-white/90 cursor-pointer"
								>
									Log out
								</button>
							</div>
						</div>
					</div>
				) : (
					<div className="mt-6 flex items-center justify-center">
						<Onboarding />
					</div>
				)}
				<footer className="pt-8 text-xs text-white/85">
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
					</div>
				</footer>
			</main>
		</div>
	);
}


