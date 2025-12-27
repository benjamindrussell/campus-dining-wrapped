import { StorySlide } from '../StorySlide';
import type { SlideProps } from '../types';

export default function TimeOfDaySlide({ data }: SlideProps) {
	return (
		<StorySlide>
			<h3 className="text-2xl font-semibold mb-2">Most Active Time</h3>
			<p className="opacity-90">When you usually grab food.</p>
		</StorySlide>
	);
}


