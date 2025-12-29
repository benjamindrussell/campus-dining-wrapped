import { useMemo } from 'react';
import { StorySlide } from '../StorySlide';
import type { SlideProps } from '../types';

export default function MostExpensiveSlide({ data }: SlideProps) {
	const transactions = data?.transactions ?? [];

	const mostExpensive = useMemo(() => {
		// Choose the transaction with the largest absolute amount (covers positive debits and negative refunds)
		let chosen: any = null;
		for (const t of transactions) {
			if (typeof t?.amount !== 'number') continue;
			if (!chosen || Math.abs(t.amount) > Math.abs(chosen.amount)) {
				chosen = t;
			}
		}
		return chosen;
	}, [transactions]);

	const amountDisplay =
		typeof mostExpensive?.amount === 'number'
			? Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(
					Math.abs(mostExpensive.amount)
				)
			: '—';
	const locationDisplay = mostExpensive?.locationName ?? '—';
	const dateIso = mostExpensive?.actualDate || mostExpensive?.postedDate || null;
	const dateDisplay = dateIso
		? new Date(dateIso).toLocaleDateString(undefined, {
				year: 'numeric',
				month: 'short',
				day: 'numeric',
			})
		: '—';
	const paymentTypeDisplay = mostExpensive?.accountName ?? '—';

	return (
		<StorySlide className="bg-[#07f2a4] text-black font-bold p-0">
			<div className="w-full max-w-md mx-auto px-6">
				<div className="mb-8 sm:mb-10 text-base">Your most expensive transaction was…</div>

				<div className="border-2 border-black p-6 sm:p-8 mb-10">
					<div className="text-6xl sm:text-7xl leading-tight">{amountDisplay}</div>
					<div className="mt-3 text-3xl sm:text-4xl leading-tight wrap-break-word">at {locationDisplay}</div>
				</div>

				<div className="mb-10 border-t-2 border-black border-dashed" />

				<div className="grid grid-cols-2 gap-4 mb-8">
					<div className="border-2 border-black p-4 sm:p-5">
						<div className="text-xs uppercase mb-1">Date</div>
						<div className="text-base">{dateDisplay}</div>
					</div>
					<div className="border-2 border-black p-4 sm:p-5">
						<div className="text-xs uppercase mb-1">Payment Type</div>
						<div className="text-base">{paymentTypeDisplay}</div>
					</div>
				</div>

				<div className="flex items-center justify-center">
					<a
						href="https://wrapped.menu"
						className="text-sm underline decoration-black"
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


