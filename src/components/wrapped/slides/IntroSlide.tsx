import { StorySlide } from '../StorySlide';
import type { SlideProps } from '../types';

export default function IntroSlide({ data }: SlideProps) {
	return (
		<StorySlide>
			<h3 className="text-3xl font-bold mb-3">Your Campus Dining Wrapped</h3>
			<p>
				You made {data?.totalCount ?? 0} transactions. Tap to advance.
			</p>
		</StorySlide>
	);
}


