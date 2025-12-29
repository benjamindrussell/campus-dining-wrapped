import { useMemo } from 'react';
import { StorySlide } from '../StorySlide';
import type { SlideProps } from '../types';

const REMARK_TEMPLATES = [
	'At this point, they should know your order.',
	'{name} basically knows you by name.',
	'You clearly had a favorite.',
	'Safe to say {name} was your go-to.',
	'You and {name} had a year together.',
];

function chooseTopLocationRemark(locationName: string): string {
	const index = Math.floor(Math.random() * REMARK_TEMPLATES.length);
	return REMARK_TEMPLATES[index].replaceAll('{name}', locationName);
}

export default function TopLocationSlide({ data }: SlideProps) {
	const transactions = data?.transactions ?? [];
	const totalCount: number = data?.totalCount ?? transactions.length ?? 0;

	const { topLocationDisplayName, topLocationCount, percent } = useMemo(() => {
		let topApiName = '';
		let count = 0;
		if (transactions.length > 0) {
			const counts = new Map<string, number>();
			for (const t of transactions) {
				const apiName = t?.locationName ?? 'Unknown';
				counts.set(apiName, (counts.get(apiName) ?? 0) + 1);
			}
			for (const [apiName, c] of counts) {
				if (c > count) {
					topApiName = apiName;
					count = c;
				}
			}
		}
		const pct = totalCount > 0 && count > 0 ? Math.round((count / totalCount) * 100) : 0;
		const displayName = topApiName || '';
		return { topLocationDisplayName: displayName, topLocationCount: count, percent: pct };
	}, [transactions, totalCount]);

	const closingRemark = useMemo(() => {
		if (!topLocationDisplayName || topLocationCount <= 0) return '';
		return chooseTopLocationRemark(topLocationDisplayName);
	}, [topLocationDisplayName, topLocationCount]);

	return (
		<StorySlide className="bg-[#F2FF49] text-black font-bold p-0">
			<div className="w-full max-w-md mx-auto px-6">
				<div className="flex items-center gap-3 mb-4 sm:mb-8">
					<div className="flex-1 border-t-2 border-black" />
					<span className="text-sm tracking-wide uppercase">Top Dining Location</span>
					<div className="flex-1 border-t-2 border-black" />
				</div>

				<div className="border-2 border-black p-6 sm:p-8 mb-8 flex flex-col">
					<div className="text-4xl sm:text-5xl leading-tight wrap-break-word">
						{topLocationDisplayName || '—'}
					</div>
					{topLocationCount > 0 ? (
						<>
							<div className="mt-6 sm:mt-8 border-t-2 border-black border-dashed" />
							<div className="mt-6 sm:mt-8 grid grid-cols-1 gap-4">
								<div className="border-2 border-black p-4 sm:p-5 text-left">
									<div className="text-base leading-relaxed">
										You visited this location {topLocationCount}{' '}
										{topLocationCount === 1 ? 'time' : 'times'} this year.
									</div>
								</div>
								<div className="border-2 border-black p-4 sm:p-5 text-left">
									<div className="text-base leading-relaxed">
										That’s {percent}% of your dining transactions.
									</div>
								</div>
							</div>
							{closingRemark ? (
								<div className="mt-6 sm:mt-8 text-base">{closingRemark}</div>
							) : null}
						</>
					) : (
						<div className="mt-3 text-base">No visits yet</div>
					)}
				</div>

				<div className="flex items-center justify-center">
					<div className="text-sm underline decoration-black pointer-events-none">https://wrapped.menu</div>
				</div>
			</div>
		</StorySlide>
	);
}


