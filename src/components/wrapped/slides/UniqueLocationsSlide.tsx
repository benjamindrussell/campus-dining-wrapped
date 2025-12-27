import { StorySlide } from '../StorySlide';
import type { SlideProps } from '../types';

export default function UniqueLocationsSlide({ data }: SlideProps) {
	return (
		<StorySlide>
			<h3 className="text-2xl font-semibold mb-2">Unique Locations</h3>
			<p className="opacity-90">How many unique places you ate.</p>
		</StorySlide>
	);
}


