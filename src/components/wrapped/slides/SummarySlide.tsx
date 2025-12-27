import { StorySlide } from '../StorySlide';
import type { SlideProps } from '../types';

export default function SummarySlide({ data, onShare }: SlideProps) {
	return (
		<StorySlide>
			<h3 className="text-2xl font-semibold mb-2">Summary + Share</h3>
			<p className="opacity-90">A concise summary of your year. Share it!</p>
			<div className="mt-6">
				<button
					className="px-4 py-2 border rounded bg-white text-black pointer-events-auto"
					onClick={onShare}
				>
					Share
				</button>
			</div>
		</StorySlide>
	);
}


