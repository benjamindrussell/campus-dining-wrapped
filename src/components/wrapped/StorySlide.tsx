import type { ReactNode } from 'react';

export function StorySlide({ children }: { children: ReactNode }) {
	return (
		<div className="w-full h-full flex flex-col items-center justify-center p-6 text-center">
			{children}
		</div>
	);
}


