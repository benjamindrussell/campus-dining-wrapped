import { useMemo } from 'react';
import { StorySlide } from '../StorySlide';
import type { SlideProps } from '../types';
import paperPlane from '../../../assets/paper-plane.png';

export default function IntroSlide({ data }: SlideProps) {
	// Derive "First Last’s" from any transaction's patronFullName; fallback to "Your"
	const fullNamePossessive = useMemo(() => {
		const transactions = (data?.transactions ?? []) as Array<{ patronFullName?: string }>;
		const raw = String(
			transactions.find((t) => typeof t?.patronFullName === 'string' && t.patronFullName.trim().length > 0)?.patronFullName ?? ''
		).trim();
		if (!raw) return 'Your';
		// Extract first and last token (letters, apostrophes, hyphens allowed)
		const parts = raw.split(/\s+/).filter(Boolean);
		const sanitize = (s: string) => s.replace(/[^A-Za-z'\-]/g, '');
		const first = sanitize(parts[0] ?? '');
		const last = sanitize(parts[parts.length - 1] ?? '');
		const name = [first, last].filter(Boolean).join(' ').trim();
		if (!name) return 'Your';
		return `${name}\u2019s`;
	}, [data]);

	return (
		<StorySlide className="bg-[#4dc6f9] text-white font-bold p-0">
			<div className="relative w-full max-w-md mx-auto h-full px-6 py-8 flex flex-col">
				{/* Title block */}
				<div className="relative z-10 flex flex-col items-center text-center">
                    <span className="text-white text-sm sm:text-base font-bold italic">{fullNamePossessive}</span>
					<h1 className="mt-1 text-red-600 font-extrabold outline-white-2 leading-tight text-5xl sm:text-6xl">
						Dayton
						<br />
						Meal Plan
						<br />
						Wrapped
					</h1>
				</div>

				{/* Paper plane image, oversized and overlapping the title */}
				<img
					src={paperPlane}
					alt="Paper plane"
					className="pointer-events-none select-none absolute left-1/2 -translate-x-1/2 top-1/2 -translate-y-[40%] w-[140%] max-w-none rotate-[8deg] z-20"
				/>

				{/* Bottom label */}
				<div className="mt-auto relative z-30 flex items-center justify-center pb-2">
					<div className="text-3xl sm:text-4xl font-extrabold">Fall 2025</div>
				</div>
			</div>
		</StorySlide>
	);
}


