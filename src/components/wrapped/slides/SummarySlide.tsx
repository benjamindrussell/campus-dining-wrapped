import { useMemo } from 'react';
import { StorySlide } from '../StorySlide';
import type { SlideProps } from '../types';
import { Share, Download, Copy, Home } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

function formatCurrency(amount: number): string {
	return Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);
}

export default function SummarySlide({ data, onShare, onDownloadImage, onCopyImage }: SlideProps) {
	const navigate = useNavigate();
	const transactions = (data?.transactions ?? []) as Array<{
		amount?: number;
		locationName?: string;
		patronFullName?: string;
	}>;

	const {
		totalSpent,
		totalTransactions,
		uniqueLocationsCount,
		topLocations,
	} = useMemo(() => {
		let spent = 0;
		let txCount = 0;
		const counts = new Map<string, number>();
		const unique = new Set<string>();

		for (const t of transactions) {
			const amount = typeof t?.amount === 'number' ? t.amount : 0;
			const location = String(t?.locationName ?? '').trim();
			// Positive amounts are spends; negatives are refunds/credits
			if (amount > 0) {
				spent += amount;
				txCount += 1;
				if (location) {
					unique.add(location);
					counts.set(location, (counts.get(location) ?? 0) + 1);
				}
			}
		}

		const top = Array.from(counts.entries())
			.sort((a, b) => b[1] - a[1])
			.slice(0, 3)
			.map(([name, count]) => ({ name, count }));

		return {
			totalSpent: spent,
			totalTransactions: txCount,
			uniqueLocationsCount: unique.size,
			topLocations: top,
		};
	}, [transactions]);

	const firstName = useMemo(() => {
		const full =
			transactions.find((t) => typeof t?.patronFullName === 'string' && t.patronFullName.trim().length > 0)
				?.patronFullName ?? '';
		const trimmed = full.trim();
		if (!trimmed) return 'Your';
		const parts = trimmed.split(/\s+/);
		let first = parts[0] ?? '';
		if (!first) return 'Your';
		first = first.replace(/[^A-Za-z'\-]/g, '');
		if (!first) return 'Your';
		return first.charAt(0).toUpperCase() + first.slice(1).toLowerCase();
	}, [transactions]);
	const possessive = firstName === 'Your' ? 'Your' : `${firstName}\u2019s`;

	// Capability detection for conditional actions
	const supportsWebShare = typeof navigator !== 'undefined' && !!(navigator as unknown as { share?: unknown }).share;
	const supportsImageCopy =
		typeof window !== 'undefined' &&
		'ClipboardItem' in window &&
		typeof navigator !== 'undefined' &&
		!!(navigator as unknown as { clipboard?: { write?: unknown } }).clipboard &&
		!!(navigator as unknown as { clipboard?: { write?: unknown } }).clipboard?.write;

	return (
		<StorySlide className="bg-[#4dc6f9] text-white font-bold p-0">
			<div className="w-full max-w-md mx-auto px-6">
				<div className="mb-0">
					<div className="mt-1 text-3xl sm:text-4xl leading-tight text-red-600 outline-white-2 font-extrabold">
						{possessive} Meal Plan Wrapped
					</div>
					<div className="text-white text-base sm:text-lg mt-2">
						Get yours at{' '}
						<span className="underline decoration-white pointer-events-none">https://wrapped.menu</span>
					</div>
				</div>

				<div className="grid grid-cols-1 gap-4 mt-2">
					<div className="border-2 border-white p-5 text-left">
						<div className="text-base leading-relaxed">Total spent</div>
						<div className="text-3xl sm:text-4xl mt-1">{formatCurrency(totalSpent)}</div>
					</div>

					<div className="grid grid-cols-2 gap-4">
						<div className="border-2 border-white p-5 text-center flex flex-col items-center justify-center h-32">
							<div className="text-sm sm:text-base leading-relaxed whitespace-nowrap">Unique locations</div>
							<div className="text-3xl sm:text-4xl mt-1">{uniqueLocationsCount}</div>
						</div>
						<div className="border-2 border-white p-5 text-center flex flex-col items-center justify-center h-32">
							<div className="text-sm sm:text-base leading-relaxed whitespace-nowrap">Transactions</div>
							<div className="text-3xl sm:text-4xl mt-1">{totalTransactions}</div>
						</div>
					</div>

					{topLocations.length > 0 ? (
						<div className="border-2 border-white p-5 text-left">
							<div className="text-base leading-relaxed">Top spots</div>
							<ul className="space-y-1 mt-2">
								{topLocations.map((loc) => (
									<li key={loc.name} className="flex items-center justify-between">
										<span className="text-xl">{loc.name}</span>
										<span className="text-white/85 text-sm">{loc.count}×</span>
									</li>
								))}
							</ul>
						</div>
					) : null}
				</div>

				<div className="mt-8 flex items-center justify-center gap-3" data-exclude-from-capture>
					{supportsWebShare ? (
						<>
							<button
								type="button"
								aria-label="Go home"
								title="Home"
								className="pointer-events-auto inline-flex items-center justify-center rounded-full bg-red-600 text-white shadow-md hover:bg-red-700 transition-colors cursor-pointer w-12 h-12"
								onClick={() => navigate('/')}
							>
								<Home className="w-5 h-5" strokeWidth={3} />
							</button>
							<button
								type="button"
								className="pointer-events-auto inline-flex items-center justify-center gap-3 px-8 py-3 rounded-full bg-red-600 text-white shadow-md hover:bg-red-700 transition-colors cursor-pointer"
								onClick={onShare}
							>
								<span>Share</span>
								<Share className="w-4 h-4" strokeWidth={3} />
							</button>
						</>
					) : (
						<>
							<button
								type="button"
								aria-label="Go home"
								title="Home"
								className="pointer-events-auto inline-flex items-center justify-center rounded-full bg-red-600 text-white shadow-md hover:bg-red-700 transition-colors cursor-pointer w-12 h-12"
								onClick={() => navigate('/')}
							>
								<Home className="w-5 h-5" strokeWidth={3} />
							</button>
							<button
								type="button"
								className="pointer-events-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-full bg-red-600 text-white shadow-md hover:bg-red-700 transition-colors cursor-pointer"
								onClick={onDownloadImage}
							>
								<span>Download</span>
								<Download className="w-4 h-4" strokeWidth={3} />
							</button>
							{supportsImageCopy ? (
								<button
									type="button"
									className="pointer-events-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-full bg-red-600 text-white shadow-md hover:bg-red-700 transition-colors cursor-pointer"
									onClick={onCopyImage}
								>
									<span>Copy</span>
									<Copy className="w-4 h-4" strokeWidth={3} />
								</button>
							) : null}
						</>
					)}
				</div>
			</div>
		</StorySlide>
	);
}


