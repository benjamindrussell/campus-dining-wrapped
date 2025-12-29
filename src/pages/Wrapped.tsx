import { useMemo, useState, type ComponentType } from 'react';
import { useTransactions } from '../hooks/useTransactions';
import { useAuth } from '../context/AuthContext';
import { ChevronLeftIcon, ChevronRightIcon } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import type { SlideProps } from '../components/wrapped/types';
import IntroSlide from '../components/wrapped/slides/IntroSlide';
import TopLocationSlide from '../components/wrapped/slides/TopLocationSlide';
import MostExpensiveSlide from '../components/wrapped/slides/MostExpensiveSlide';
import MoneySavedSlide from '../components/wrapped/slides/MoneySavedSlide';
import TimeOfDaySlide from '../components/wrapped/slides/TimeOfDaySlide';
import SummarySlide from '../components/wrapped/slides/SummarySlide';

export default function Wrapped() {
	const { data, isLoading, isError, refetch } = useTransactions();
	const { clearCredentials } = useAuth();
	const [index, setIndex] = useState(0);
	const [direction, setDirection] = useState<1 | -1>(1);

	// Story slides (placeholder content for now)
	const slides = useMemo(
		() => [
			{
				key: 'intro',
				title: 'Your Campus Dining Wrapped',
				body: `You made ${data?.totalCount ?? 0} transactions. Tap to advance.`,
			},
			{
				key: 'topLocation',
				title: 'Top Dining Location',
				body: 'Placeholder: Your most visited dining spot.',
			},
			{
				key: 'timeOfDay',
				title: 'Most Active Time',
				body: 'Placeholder: When you usually grab food.',
			},
			{
				key: 'mostExpensive',
				title: 'Most Expensive Transaction',
				body: 'Placeholder: The priciest meal of the year.',
			},
			{
				key: 'moneySaved',
				title: 'Money Saved / Lost',
				body: 'Your refunds vs spending and net change.',
			},
			{
				key: 'summary',
				title: 'Summary + Share',
				body: 'A concise summary of your year. Share it!',
			},
		],
		[data?.totalCount]
	);

	const isLast = index >= slides.length - 1;

	function goPrev() {
		if (index > 0) {
			setDirection(-1);
			setIndex(index - 1);
		}
	}
	function goNext() {
		if (!isLast) {
			setDirection(1);
			setIndex(index + 1);
		}
	}

	// Share button on last story
	async function handleShare() {
		const text = 'My Campus Dining Wrapped is here! Check it out.';
		const url = typeof window !== 'undefined' ? window.location.href : '';
		try {
			const anyNav = navigator as unknown as {
				share?: (opts: { title?: string; text?: string; url?: string }) => Promise<void>;
				clipboard?: { writeText?: (text: string) => Promise<void> };
			};
			if (anyNav?.share) {
				await anyNav.share({ title: 'Campus Dining Wrapped', text, url });
				return;
			}
			if (anyNav?.clipboard?.writeText) {
				await anyNav.clipboard.writeText(`${text}\n${url}`);
				alert('Link copied to clipboard!');
				return;
			}
			// eslint-disable-next-line no-alert
			alert(`${text}\n${url}`);
		} catch {
			// eslint-disable-next-line no-alert
			alert('Unable to share right now.');
		}
	}

	type SlideKey =
		| 'intro'
		| 'topLocation'
		| 'mostExpensive'
		| 'moneySaved'
		| 'timeOfDay'
		| 'summary';

	const slideRegistry: Record<SlideKey, ComponentType<SlideProps>> = {
		intro: IntroSlide,
		topLocation: TopLocationSlide,
		mostExpensive: MostExpensiveSlide,
		moneySaved: MoneySavedSlide,
		timeOfDay: TimeOfDaySlide,
		summary: SummarySlide,
	};

	const ActiveSlide = slideRegistry[slides[index].key as SlideKey];

	const variants = {
		enter: (dir: number) => ({
			x: dir > 0 ? 40 : -40,
			opacity: 0,
		}),
		center: {
			x: 0,
			opacity: 1,
		},
		exit: (dir: number) => ({
			x: dir > 0 ? -40 : 40,
			opacity: 0,
		}),
	};

	// Adjust UI chrome (progress bars, arrows) per-slide if needed
	const isTopLocationSlide = slides[index].key === 'topLocation';
	const isMostExpensiveSlide = slides[index].key === 'mostExpensive';
	const isTimeOfDaySlide = slides[index].key === 'timeOfDay';
	const isMoneySavedSlide = slides[index].key === 'moneySaved';
	const useDarkUiChrome = isTopLocationSlide || isMostExpensiveSlide;
	const progressTrackClass = useDarkUiChrome ? 'bg-black/30' : 'bg-white/30';
	const progressFillClass = useDarkUiChrome ? 'bg-black' : 'bg-white';
	const arrowColorClass = useDarkUiChrome ? 'text-black/60' : 'text-white/60';
	const outerBgClass = isTopLocationSlide
		? 'bg-[#E7F432]'
		: isMoneySavedSlide
		? 'bg-[#f42d2d]'
		: isMostExpensiveSlide
		? 'bg-[#11d090]'
		: isTimeOfDaySlide
		? 'bg-[#514ac9]'
		: 'bg-black';

	if (isLoading) {
		return <div className="p-4">Loading your wrapped…</div>;
	}
	if (isError) {
		return (
			<div className="p-4">
				<p>Failed to load data.</p>
				<div className="space-x-2 mt-2">
					<button className="underline" onClick={() => refetch()}>
						Retry
					</button>
					<button className="underline" onClick={() => clearCredentials()}>
						Reset device
					</button>
				</div>
			</div>
		);
	}

	return (
		<div className={`w-screen h-screen flex items-center justify-center ${outerBgClass} transition-colors duration-300`}>
			<div className="relative w-[min(100vw,56.25vh)] aspect-9/16 rounded-2xl overflow-hidden bg-black text-white select-none">
				{/* Progress bars */}
				<div className="absolute top-0 left-0 right-0 p-3 flex gap-1 pointer-events-none z-20">
					{slides.map((s, i) => (
						<div key={s.key} className={`flex-1 h-1.5 ${progressTrackClass} rounded`}>
							<div
								className={`h-1.5 ${progressFillClass} rounded`}
								style={{ width: `${i <= index ? 100 : 0}%` }}
							/>
						</div>
					))}
				</div>

				{/* Arrow hints */}
				<div className="pointer-events-none absolute inset-0 z-20">
					<div className="absolute left-3 top-1/2 -translate-y-1/2">
						<ChevronLeftIcon className={arrowColorClass} />
					</div>
					<div className="absolute right-3 top-1/2 -translate-y-1/2">
						<ChevronRightIcon className={arrowColorClass} />
					</div>
				</div>

				{/* Tap zones */}
				<button
					type="button"
					className="absolute inset-y-0 left-0 w-1/2 cursor-pointer"
					onClick={goPrev}
					aria-label="Previous story"
				/>
				<button
					type="button"
					className="absolute inset-y-0 right-0 w-1/2 cursor-pointer"
					onClick={goNext}
					aria-label="Next story"
				/>

				{/* Content with transitions */}
				<AnimatePresence initial={false} custom={direction} mode="popLayout">
					<motion.div
						key={slides[index].key}
						custom={direction}
						variants={variants}
						initial="enter"
						animate="center"
						exit="exit"
						transition={{ type: 'spring', stiffness: 400, damping: 40, mass: 0.8 }}
						className="absolute inset-0 pointer-events-none z-10"
					>
						<ActiveSlide data={data} onShare={handleShare} />
					</motion.div>
				</AnimatePresence>
			</div>
		</div>
	);
}