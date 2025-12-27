import type { SlideProps } from '../types';

export default function TopLocationSlide({ data }: SlideProps) {
	return (
		<div className="w-full h-full relative">
			<div className="absolute inset-0 bg-gradient-to-br from-fuchsia-600/60 to-indigo-600/60" />
			<div className="absolute inset-0 flex items-center justify-center p-6 text-center">
				<div>
					<h3 className="text-2xl font-semibold mb-2">Top Dining Location</h3>
					<p className="opacity-90">Your most visited spot.</p>
				</div>
			</div>
		</div>
	);
}


