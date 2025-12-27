import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

type Step = 1 | 2;

export default function Onboarding() {
	const [step, setStep] = useState<Step>(1);
	const [linkValue, setLinkValue] = useState('');
	const navigate = useNavigate();

	const loginUrl = 'https://get.cbord.com/udayton/full/login.php?mobileapp=1';

	const onClickLogin = () => {
		setStep(2);
	};

	const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
		e.preventDefault();
		try {
			const url = new URL(linkValue);
			const sessionId = url.searchParams.get('sessionId');
			if (!sessionId) {
				alert('No sessionId found in URL.');
				return;
			}
			navigate(`/capture?sessionId=${encodeURIComponent(sessionId)}`);
		} catch {
			alert('Please paste a valid URL that contains ?sessionId=...');
		}
	};

	return (
		<div className="bg-white max-w-[400px] w-full rounded-lg mt-6 p-5 text-center">
			<h3 className="font-bold">Let's get you logged in!</h3>

			<div className="mt-4">
				{/* STEP 1 */}
				<div
					className={[
						'relative w-full border-l-2 pl-8 pr-2 pb-6 text-left transition-colors',
						step === 2 ? 'border-blue-900' : 'border-gray-200',
					].join(' ')}
				>
					{/* number bubble */}
					<span
						className={[
							'absolute left-0 top-0 -translate-x-1/2 grid h-7 w-7 place-items-center rounded-full text-sm font-bold transition-colors',
							step === 2 ? 'bg-blue-900 text-white' : 'bg-gray-200 text-gray-600',
						].join(' ')}
					>
						1
					</span>

					<div className="font-semibold text-gray-900">Sign in with GET</div>
					<div className="mt-1 text-sm text-gray-600">We'll need access to your GET account.</div>
					<div className="mt-1 text-sm text-gray-600">Open this link and sign in with your UD info.</div>

					<a
						href={loginUrl}
						target="_blank"
						rel="noreferrer"
						onClick={onClickLogin}
						className="mt-3 inline-flex items-center justify-center gap-2 rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700"
					>
						Log in
						<span aria-hidden>↗</span>
					</a>

					{step === 2 && <div className="mt-2 text-xs font-semibold text-blue-900">✓ Done. Now paste the validated link below</div>}
				</div>
			</div>

			{/* STEP 2 */}
			<div
				className={[
					'relative w-full border-l-2 pl-8 pr-2 pb-2 text-left transition-colors',
					step === 2 ? 'border-gray-200 opacity-100' : 'border-gray-200 opacity-50 pointer-events-none',
				].join(' ')}
			>
				<span
					className={[
						'absolute left-0 top-0 -translate-x-1/2 grid h-7 w-7 place-items-center rounded-full text-sm font-bold transition-colors',
						step === 2 ? 'bg-white border border-blue-900 text-blue-900' : 'bg-gray-200 text-gray-600',
					].join(' ')}
				>
					2
				</span>

				<div className="font-semibold text-gray-900">Paste the validated page link</div>
				<div className="mt-1 text-sm text-gray-600">
					After you see <span className="font-semibold">“validated”</span>, copy the page link and paste it here.
				</div>

				<form onSubmit={onSubmit} className="mt-3 space-y-3">
					<div className="rounded-lg border border-gray-200 p-2">
						<input
							value={linkValue}
							onChange={(e) => setLinkValue(e.target.value)}
							placeholder="https://..."
							className="w-full text-sm outline-none"
						/>
					</div>

					<button
						type="submit"
						disabled={linkValue.trim() === ''}
						className={[
							'inline-flex w-full items-center justify-center rounded-lg px-4 py-2 text-sm font-semibold',
							linkValue.trim() !== '' ? 'bg-blue-900 text-white hover:bg-blue-950 cursor-pointer' : 'bg-gray-200 text-gray-500 cursor-not-allowed',
						].join(' ')}
					>
						Continue
					</button>
				</form>
			</div>
		</div>
	);
}


