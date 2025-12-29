type CbordResponse<T> = {
	response: T;
	exception: unknown | null;
};

const CBORD_BASE = 'https://services.get.cbord.com/GETServices/services/json';

async function postJson<T>(path: string, body: unknown): Promise<CbordResponse<T>> {
	const res = await fetch(`${CBORD_BASE}/${path}`, {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
		},
		body: JSON.stringify(body),
		mode: 'cors',
	});
	if (!res.ok) {
		throw new Error(`CBORD ${path} HTTP ${res.status}`);
	}
	const json = (await res.json()) as CbordResponse<T>;
	return json;
}

export async function createPin(params: {
	deviceId: string;
	pin: string;
	sessionId: string;
}): Promise<boolean> {
	const { deviceId, pin, sessionId } = params;
	const body = {
		method: 'createPIN',
		params: {
			PIN: pin,
			deviceId,
			sessionId,
		},
	};
	const json = await postJson<boolean>('user', body);
	if (json.exception) {
		throw new Error(`createPIN failed: ${JSON.stringify(json.exception)}`);
	}
	return json.response === true;
}

export async function authenticatePin(params: {
	deviceId: string;
	pin: string;
}): Promise<string> {
	const { deviceId, pin } = params;
	const body = {
		method: 'authenticatePIN',
		params: {
			systemCredentials: {
				domain: '',
				userName: 'get_mobile',
				password: 'NOTUSED',
			},
			deviceId,
			pin,
		},
	};
	const json = await postJson<string>('authentication', body);
	if (json.exception) {
		throw new Error(`authenticatePIN failed: ${JSON.stringify(json.exception)}`);
	}
	return json.response;
}

import type { Transaction } from './types';

export async function retrieveTransactions(params: {
	sessionId: string;
	oldestDate: string | null;
	newestDate?: string | null;
	maxReturnMostRecent?: number;
	paymentSystemType?: number;
	accountId?: string | null;
}): Promise<{ totalCount: number; returnCapped: boolean; transactions: Transaction[] }> {
	const {
		sessionId,
		oldestDate,
		newestDate = null,
		maxReturnMostRecent = 100,
		paymentSystemType = 0,
		accountId = null,
	} = params;
	const body = {
		method: 'retrieveTransactionHistoryWithinDateRange',
		params: {
			paymentSystemType,
			queryCriteria: {
				maxReturnMostRecent,
				newestDate,
				oldestDate,
				accountId,
			},
			sessionId,
		},
	};
	const json = await postJson<{ totalCount: number; returnCapped: boolean; transactions: Transaction[] }>('commerce', body);
	if (json.exception) {
		throw new Error(`retrieveTransactions failed: ${JSON.stringify(json.exception)}`);
	}
	return json.response;
}


