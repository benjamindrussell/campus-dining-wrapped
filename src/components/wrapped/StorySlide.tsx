import type { ReactNode } from 'react';

export function StorySlide({ children, className }: { children: ReactNode; className?: string }) {
	return (
		<div className={`w-full h-full flex flex-col items-center justify-center p-6 text-center ${className ?? ''}`}>
			{children}
		</div>
	);
}


