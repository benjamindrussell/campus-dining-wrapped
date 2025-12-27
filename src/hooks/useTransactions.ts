import { useQuery } from '@tanstack/react-query';
import { retrieveTransactions, type Transaction } from '../lib/api';
import { useAuth } from '../context/AuthContext';

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
			let sessionId = await ensureSessionId();
			try {
				const result = await retrieveTransactions({
					sessionId,
					oldestDate: getDefaultOldestDate(),
					newestDate: null,
					maxReturnMostRecent: 100,
				});
				return { totalCount: result.totalCount, transactions: result.transactions };
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
				return { totalCount: result.totalCount, transactions: result.transactions };
			}
		},
		staleTime: 1000 * 60, // 1 minute
	});
}