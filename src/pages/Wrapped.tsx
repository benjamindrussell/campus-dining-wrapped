import { useMemo, useRef, useState, type ComponentType } from 'react';
import { useTransactions } from '../hooks/useTransactions';
import { useAuth } from '../context/AuthContext';
import { ChevronLeftIcon, ChevronRightIcon } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import type { SlideProps } from '../components/wrapped/types';
import { toBlob } from 'html-to-image';
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
	const slideRef = useRef<HTMLDivElement>(null);
	// Lightweight Safari detection (excludes Chrome/Chromium on iOS)
	const isLikelySafari =
		typeof navigator !== 'undefined' &&
		/Safari/i.test(navigator.userAgent) &&
		!/Chrome|Chromium|CriOS|Android/i.test(navigator.userAgent);
	// Exclude interactive controls from captured image
	const captureFilter = (domNode: HTMLElement) => !domNode.closest?.('[data-exclude-from-capture]');

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
		const nodeToCapture =
			slideRef.current ?? (document.querySelector('[data-slide-capture-root]') as HTMLElement | null);
		const text = "Here's my Dayton meal plan wrapped. Get yours at https://wrapped.menu";
		let renderedBlob: Blob | null = null;
		let imageFile: File | null = null;

		function isUserDismiss(err: unknown) {
			// Browsers throw DOMException AbortError when user cancels share
			// Some also throw NotAllowedError with a "Must be handling a user gesture" message after cancel
			if (err && typeof err === 'object') {
				const e = err as DOMException & { message?: string };
				return (
					e.name === 'AbortError' ||
					(e.name === 'NotAllowedError' && typeof e.message === 'string' && /user gesture|canceled|cancelled/i.test(e.message))
				);
			}
			return false;
		}

		if (!nodeToCapture) {
			// eslint-disable-next-line no-alert
			alert('Nothing to share yet. Try again.');
			return;
		}

		// 1) Try to render an image of the slide. If it fails, continue to text-only share.
		try {
			// Ensure text outline renders on Safari by toggling a capture class
			if (isLikelySafari) nodeToCapture.classList.add('capture-outline');
			try {
				renderedBlob = await toBlob(nodeToCapture, {
					pixelRatio: 3,
					backgroundColor: getComputedStyle(nodeToCapture).backgroundColor || '#000',
					cacheBust: true,
					filter: captureFilter,
				});
			} finally {
				if (isLikelySafari) nodeToCapture.classList.remove('capture-outline');
			}
		} catch (err) {
			console.error('toBlob failed:', err);
			renderedBlob = null;
		}

		// 2) If we have an image blob, attempt file share first.
		try {
			if (renderedBlob) {
				try {
					imageFile = new File([renderedBlob], 'wrapped.png', { type: 'image/png' });
				} catch (err) {
					// Older iOS/Safari may not support File constructor; fall back to skipping file-share
					console.error('File constructor failed, skipping file share:', err);
					imageFile = null;
				}
			}

			const anyNavigator = navigator as unknown as {
				canShare?: (data: { files?: File[] }) => boolean;
				share?: (opts: { files?: File[]; title?: string; text?: string; url?: string }) => Promise<void>;
				clipboard?: { writeText?: (text: string) => Promise<void> };
			};

			// Prefer sharing the image directly (where supported)
			if (imageFile && anyNavigator?.canShare?.({ files: [imageFile] }) && anyNavigator?.share) {
				try {
					await anyNavigator.share({
						files: [imageFile],
						text,
					});
					return;
				} catch (err) {
					if (isUserDismiss(err)) {
						// User canceled share sheet; do nothing.
						return;
					}
					console.error('navigator.share (files) failed:', err);
					// Fall through to text or download
				}
			}

			// Fallback to text+URL share if files not supported
			if (anyNavigator?.share) {
				try {
					await anyNavigator.share({ text });
					return;
				} catch (err) {
					if (isUserDismiss(err)) {
						// User canceled share sheet; do nothing.
						return;
					}
					console.error('navigator.share (text) failed:', err);
					// Fall through to download/copy
				}
			}

			// Final fallback: download image and optionally copy link
			if (renderedBlob) {
				try {
					const objectUrl = URL.createObjectURL(renderedBlob);
					const downloadAnchor = document.createElement('a');
					downloadAnchor.href = objectUrl;
					downloadAnchor.download = 'wrapped.png';
					document.body.appendChild(downloadAnchor);
					downloadAnchor.click();
					downloadAnchor.remove();
					URL.revokeObjectURL(objectUrl);
				} catch (err) {
					console.error('Download fallback failed:', err);
				}
			}

			// Only attempt clipboard copy if page is focused and API exists
			if (document.hasFocus && !document.hasFocus()) {
				return;
			}
			if (anyNavigator?.clipboard?.writeText) {
				try {
					await anyNavigator.clipboard.writeText(text);
					// eslint-disable-next-line no-alert
					alert('Image saved (if supported). Link copied. Open Instagram → Your story and pick the saved image.');
					return;
				} catch (err) {
					console.error('Clipboard write failed:', err);
				}
			}

			// No alert here to avoid overlapping dialogs after a canceled share; rely on download dialog UX
		} catch (err) {
			console.error('Share flow failed:', err);
			// eslint-disable-next-line no-alert
			alert('Unable to share right now.');
		}
	}

	// Helpers for explicit Download/Copy actions when Web Share isn't supported
	async function captureSlideBlob(): Promise<Blob | null> {
		const nodeToCapture =
			slideRef.current ?? (document.querySelector('[data-slide-capture-root]') as HTMLElement | null);
		if (!nodeToCapture) {
			// eslint-disable-next-line no-alert
			alert('Nothing to capture yet. Try again.');
			return null;
		}
		try {
			if (isLikelySafari) nodeToCapture.classList.add('capture-outline');
			const blob = await toBlob(nodeToCapture, {
				pixelRatio: 3,
				backgroundColor: getComputedStyle(nodeToCapture).backgroundColor || '#000',
				cacheBust: true,
				filter: captureFilter,
			});
			if (isLikelySafari) nodeToCapture.classList.remove('capture-outline');
			return blob;
		} catch (err) {
			console.error('toBlob failed:', err);
			if (isLikelySafari) nodeToCapture.classList.remove('capture-outline');
			return null;
		}
	}

	async function handleDownloadImage() {
		try {
			const renderedBlob = await captureSlideBlob();
			if (!renderedBlob) return;
			const objectUrl = URL.createObjectURL(renderedBlob);
			const downloadAnchor = document.createElement('a');
			downloadAnchor.href = objectUrl;
			downloadAnchor.download = 'wrapped.png';
			document.body.appendChild(downloadAnchor);
			downloadAnchor.click();
			downloadAnchor.remove();
			URL.revokeObjectURL(objectUrl);
		} catch (err) {
			console.error('Download action failed:', err);
			// eslint-disable-next-line no-alert
			alert('Unable to download image.');
		}
	}

	async function handleCopyImage() {
		try {
			const renderedBlob = await captureSlideBlob();
			if (!renderedBlob) return;
			const anyNavigator = navigator as unknown as {
				clipboard?: {
					write?: (items: unknown[]) => Promise<void>;
				};
			};
			const AnyClipboardItem = (window as unknown as { ClipboardItem?: any }).ClipboardItem;
			if (!AnyClipboardItem || !anyNavigator?.clipboard?.write) {
				// eslint-disable-next-line no-alert
				alert('Image copy is not supported in this browser.');
				return;
			}
			const clipboardItem = new AnyClipboardItem({ 'image/png': renderedBlob });
			await anyNavigator.clipboard.write([clipboardItem]);
			// eslint-disable-next-line no-alert
			alert('Image copied to clipboard!');
		} catch (err) {
			console.error('Copy image failed:', err);
			// eslint-disable-next-line no-alert
			alert('Unable to copy image to clipboard.');
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
	const isSummarySlide = slides[index].key === 'summary';
	const useDarkUiChrome = isTopLocationSlide || isMostExpensiveSlide;
	const progressTrackClass = useDarkUiChrome ? 'bg-black/30' : 'bg-white/30';
	const progressFillClass = useDarkUiChrome ? 'bg-black' : 'bg-white';
	const arrowColorClass = useDarkUiChrome ? 'text-black/60' : 'text-white/60';
	const outerBgClass = isSummarySlide
		? 'bg-sky-400'
		: isTopLocationSlide
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
						<div data-slide-capture-root ref={slideRef} className="w-full h-full">
							<ActiveSlide
								data={data}
								onShare={handleShare}
								onDownloadImage={handleDownloadImage}
								onCopyImage={handleCopyImage}
							/>
						</div>
					</motion.div>
				</AnimatePresence>
			</div>
		</div>
	);
}