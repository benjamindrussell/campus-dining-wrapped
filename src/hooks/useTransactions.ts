import { useQuery } from '@tanstack/react-query';
import { retrieveTransactions } from '../lib/api';
import { normalizeTransactions } from '../lib/normalize';
import type { Transaction } from '../lib/types';
import { useAuth } from '../context/AuthContext';
import { buildMockTransactions } from '../lib/mockData';

function getDefaultOldestDate(): string {
	const now = new Date();
	const startOfYear = new Date(now.getFullYear(), 0, 1);
	return startOfYear.toISOString();
}

export function useTransactions() {
	const { ensureSessionId, setSessionId } = useAuth();
	return useQuery({
		queryKey: ['transactions'],
		queryFn: async (): Promise<{ totalCount: number; transactions: Transaction[] }> => {
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
			let sessionId = await ensureSessionId();
			try {
				const result = await retrieveTransactions({
					sessionId,
					oldestDate: getDefaultOldestDate(),
					newestDate: null,
					maxReturnMostRecent: 100,
				});
				const normalized = normalizeTransactions(result.transactions);
				return { totalCount: normalized.length, transactions: normalized };
			} catch (e) {
				// Try once with a fresh session id (session might have expired)
				sessionId = await ensureSessionId();
				const result = await retrieveTransactions({
					sessionId,
					oldestDate: getDefaultOldestDate(),
					newestDate: null,
					maxReturnMostRecent: 100,
				});
				// Save the sessionId in case it changed
				setSessionId(sessionId);
				const normalized = normalizeTransactions(result.transactions);
				return { totalCount: normalized.length, transactions: normalized };
			}
		},
		staleTime: 1000 * 60, // 1 minute
	});
}