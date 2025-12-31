import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { AuthProvider } from './context/AuthContext.tsx'
import posthog from 'posthog-js'

const queryClient = new QueryClient()

// Initialize PostHog with all automatic tracking disabled
const POSTHOG_KEY = import.meta.env.VITE_POSTHOG_KEY as string | undefined
if (POSTHOG_KEY) {
	posthog.init(POSTHOG_KEY, {
		api_host: (import.meta as any).env.VITE_POSTHOG_HOST || 'https://app.posthog.com',
		autocapture: false,
		capture_pageview: false,
		capture_pageleave: false,
		disable_session_recording: true,
	})
}

createRoot(document.getElementById('root')!).render(
	<StrictMode>
		<QueryClientProvider client={queryClient}>
			<AuthProvider>
				<App />
			</AuthProvider>
		</QueryClientProvider>
	</StrictMode>,
)
