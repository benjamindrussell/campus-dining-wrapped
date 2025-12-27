import { StorySlide } from '../StorySlide';
import type { SlideProps } from '../types';

export default function MostExpensiveSlide({ data }: SlideProps) {
	return (
		<StorySlide>
			<h3 className="text-2xl font-semibold mb-2">Most Expensive Transaction</h3>
			<p className="opacity-90">The priciest meal of the year.</p>
		</StorySlide>
	);
}


