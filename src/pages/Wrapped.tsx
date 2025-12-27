import { useTransactions } from '../hooks/useTransactions';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

export default function Wrapped() {
	const { data, isLoading, isError, refetch } = useTransactions();
	const { clearCredentials } = useAuth();
	const navigate = useNavigate();

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
		<div className="p-4 space-y-4">
			<div className="flex items-center justify-between">
				<h2 className="text-lg font-semibold">Your Wrapped (placeholder)</h2>
				<button
					className="underline"
					onClick={() => {
						clearCredentials();
						navigate('/');
					}}
				>
					Log out
				</button>
			</div>
			<p>Total transactions: {data?.totalCount ?? 0}</p>
			<ul className="space-y-2">
				{data?.transactions.slice(0, 10).map((t) => (
					<li key={t.transactionKey} className="border p-2">
						<div className="flex justify-between">
							<span>{t.locationName}</span>
							<span>${t.amount.toFixed(2)}</span>
						</div>
						<div className="text-sm opacity-75">
							{new Date(t.actualDate).toLocaleString()} — {t.accountName}
						</div>
					</li>
				))}
			</ul>
		</div>
	);
}


