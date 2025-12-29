import { useMemo } from 'react';
import { StorySlide } from '../StorySlide';
import type { SlideProps } from '../types';

export default function TimeOfDaySlide({ data }: SlideProps) {
	const transactions = data?.transactions ?? [];

	const { bucketCounts, bucketLabels, maxBucketCount, topHour, topHourCount } = useMemo(() => {
		// Count transactions per hour of day (0-23) in local time
		const BUCKET_SIZE_HOURS = 3; // larger buckets for clearer layout (8 total)
		const countsByHour: number[] = Array.from({ length: 24 }, () => 0);
		for (const t of transactions) {
			const dateIso = t?.actualDate || t?.postedDate;
			if (!dateIso) continue;
			const d = new Date(dateIso);
			if (isNaN(d.getTime())) continue;
			const hour = d.getHours();
			if (hour >= 0 && hour <= 23) {
				countsByHour[hour] += 1;
			}
		}

		// Find single most active hour
		let bestHour = 0;
		let bestHourCount = 0;
		for (let h = 0; h < 24; h++) {
			if (countsByHour[h] > bestHourCount) {
				bestHourCount = countsByHour[h];
				bestHour = h;
			}
		}

		// Group into BUCKET_SIZE_HOURS buckets (e.g., 3-hour: [0-2], [3-5], ...)
		const labels: string[] = [];
		const buckets: number[] = [];
		let maxBucket = 0;
		for (let start = 0; start < 24; start += BUCKET_SIZE_HOURS) {
			let count = 0;
			for (let h = start; h < start + BUCKET_SIZE_HOURS; h++) {
				count += countsByHour[h % 24];
			}
			buckets.push(count);
			maxBucket = Math.max(maxBucket, count);
			labels.push(`${formatHourShort(start)}-${formatHourShort((start + BUCKET_SIZE_HOURS) % 24)}`);
		}

		return {
			bucketCounts: buckets,
			bucketLabels: labels,
			maxBucketCount: maxBucket,
			topHour: bestHour,
			topHourCount: bestHourCount,
		};
	}, [transactions]);

	function formatHourShort(hour: number): string {
		// 0 -> 12a, 1 -> 1a, ..., 12 -> 12p, 13 -> 1p
		const isPm = hour >= 12;
		const base = hour % 12 === 0 ? 12 : hour % 12;
		return `${base}${isPm ? 'p' : 'a'}`;
	}

	function formatHourLong(hour: number): string {
		const isPm = hour >= 12;
		const base = hour % 12 === 0 ? 12 : hour % 12;
		return `${base} ${isPm ? 'PM' : 'AM'}`;
	}

	const hasData = (data?.totalCount ?? 0) > 0 && bucketCounts.some((c) => c > 0);

	return (
		<StorySlide className="bg-[#645dd7] text-white font-bold p-0">
			<div className="w-full max-w-md mx-auto px-6">
				<div className="mb-6 sm:mb-8">
					<div className="text-sm tracking-wide uppercase">Your dining rhythm</div>
					<div className="mt-2 text-4xl sm:text-5xl leading-tight">The Times You Ate</div>
				</div>

				{hasData ? (
					<>
						<div className="h-48 sm:h-56 w-full grid grid-cols-8 gap-2 items-end">
							{bucketCounts.map((count, i) => {
								const heightPct = maxBucketCount > 0 ? Math.round((count / maxBucketCount) * 100) : 0;
								return (
									<div key={i} className="flex flex-col items-center justify-end h-full">
										<div
											className="w-full bg-white"
											style={{
												height: `${heightPct}%`,
												minHeight: count > 0 ? 4 : 0,
											}}
										/>
										<div className="mt-2 text-[10px] sm:text-xs whitespace-nowrap">
											{bucketLabels[i]}
										</div>
									</div>
								);
							})}
						</div>
						<div className="mt-5 sm:mt-6 border-t-2 border-white border-dashed" />

						<div className="mt-6 sm:mt-8 grid grid-cols-1 gap-3">
							<div className="border-2 border-white p-4 sm:p-5 text-left">
								<div className="text-xs uppercase mb-1">Most active hour</div>
								<div className="text-base">
									{formatHourLong(topHour)}{' '}
									{topHourCount > 0 ? `(${topHourCount} ${topHourCount === 1 ? 'transaction' : 'transactions'})` : ''}
								</div>
							</div>
						</div>
					</>
				) : (
					<div className="text-base">Not enough data yet</div>
				)}

				<div className="mt-6 flex items-center justify-center">
					<a
						href="https://wrapped.menu"
						className="text-sm underline decoration-white"
						rel="noopener noreferrer"
						target="_blank"
					>
						https://wrapped.menu
					</a>
				</div>
			</div>
		</StorySlide>
	);
}


