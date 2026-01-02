import { useQuery } from '@tanstack/react-query';
import { retrieveTransactions } from '../lib/api';
import { normalizeTransactions } from '../lib/normalize';
import type { Transaction } from '../lib/types';
import { useAuth } from '../context/AuthContext';
import { buildMockTransactions } from '../lib/mockData';

export const TRANSACTIONS_QUERY_KEY = ['transactions'] as const;

export async function fetchTransactions(params: {
	ensureSessionId: () => Promise<string>;
	refreshSessionId: () => Promise<string>;
	setSessionId: (sessionId: string | null) => void;
}): Promise<{ totalCount: number; transactions: Transaction[] }> {
	// Developer-testing hook: support mock datasets via ?mock=standard|standardOver|flex|flyer|neighborhood
	const mockKind =
		typeof window !== 'undefined'
			? new URLSearchParams(window.location.search).get('mock')
			: null;
	if (
		mockKind === 'standard' ||
		mockKind === 'standardOver' ||
		mockKind === 'flex' ||
		mockKind === 'flyer' ||
		mockKind === 'neighborhood'
	) {
		const mocked = normalizeTransactions(buildMockTransactions(mockKind));
		return { totalCount: mocked.length, transactions: mocked };
	}
	let sessionId = await params.ensureSessionId();
	try {
		const result = await retrieveTransactions({
			sessionId,
			oldestDate: '2025-08-22T00:00:00.000Z',
			newestDate: '2025-12-12T23:59:59.999Z',
			maxReturnMostRecent: 100,
		});
		const normalized = normalizeTransactions(result.transactions);
		return { totalCount: normalized.length, transactions: normalized };
	} catch (e) {
		// Try once with a fresh session id (session might have expired)
		sessionId = await params.refreshSessionId();
		const result = await retrieveTransactions({
			sessionId,
			oldestDate: '2025-08-22T00:00:00.000Z',
			newestDate: '2025-12-12T23:59:59.999Z',
			maxReturnMostRecent: 100,
		});
		// Save the sessionId in case it changed
		params.setSessionId(sessionId);
		const normalized = normalizeTransactions(result.transactions);
		return { totalCount: normalized.length, transactions: normalized };
	}
}

export function useTransactions() {
	const { ensureSessionId, refreshSessionId, setSessionId } = useAuth();
	return useQuery({
		queryKey: TRANSACTIONS_QUERY_KEY,
		queryFn: () =>
			fetchTransactions({
				ensureSessionId,
				refreshSessionId,
				setSessionId,
			}),
		staleTime: 1000 * 60, // 1 minute
	});
}