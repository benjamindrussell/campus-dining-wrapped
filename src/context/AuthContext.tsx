import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { authenticatePin, createPin, retrieveUserId } from '../lib/api';
import {
	loadCredentials,
	saveCredentials,
	clearCredentials as clearStored,
	loadSessionId as loadStoredSessionId,
	saveSessionId as saveStoredSessionId,
	clearSessionId as clearStoredSessionId,
} from '../lib/storage';
import { generatePin4, generateUuidV4 } from '../lib/ids';
import posthog from 'posthog-js';

type AuthContextValue = {
	deviceId: string | null;
	pin: string | null;
	sessionId: string | null;
	isAuthenticated: boolean;
	setCredentials: (deviceId: string, pin: string) => void;
	clearCredentials: () => void;
	setSessionId: (sessionId: string | null) => void;
	ensureSessionId: () => Promise<string>;
	refreshSessionId: () => Promise<string>;
	createCredentialsWithValidatorSession: (validatorSessionId: string) => Promise<{ deviceId: string; pin: string; sessionId: string }>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider(props: { children: React.ReactNode }) {
	const existing = loadCredentials();
	const existingSessionId = loadStoredSessionId();
	const [deviceId, setDeviceId] = useState<string | null>(existing?.deviceId ?? null);
	const [pin, setPin] = useState<string | null>(existing?.pin ?? null);
	const [sessionIdState, _setSessionIdState] = useState<string | null>(existingSessionId ?? null);

	// Minimal, one-way hashing of CBORD user id so the raw id is never used
	async function sha256Hex(input: string): Promise<string> {
		const enc = new TextEncoder();
		const data = enc.encode(input);
		const hash = await crypto.subtle.digest('SHA-256', data);
		const bytes = new Uint8Array(hash);
		return Array.from(bytes)
			.map((b) => b.toString(16).padStart(2, '0'))
			.join('');
	}

	const setSessionId = useCallback((next: string | null) => {
		if (next) {
			saveStoredSessionId(next);
		} else {
			clearStoredSessionId();
		}
		_setSessionIdState(next);
	}, []);

	const setCredentials = useCallback((nextDeviceId: string, nextPin: string) => {
		saveCredentials(nextDeviceId, nextPin);
		setDeviceId(nextDeviceId);
		setPin(nextPin);
	}, []);

	const clearCredentials = useCallback(() => {
		clearStored();
		setDeviceId(null);
		setPin(null);
		setSessionId(null);
	}, []);

	const ensureSessionId = useCallback(async (): Promise<string> => {
		if (sessionIdState) return sessionIdState;
		// If we don't have a session in memory, try loading from storage
		const maybeStored = loadStoredSessionId();
		if (maybeStored) {
			_setSessionIdState(maybeStored);
			return maybeStored;
		}
		if (!deviceId || !pin) throw new Error('Missing device credentials');
		const newSession = await authenticatePin({ deviceId, pin });
		setSessionId(newSession);
		return newSession;
	}, [deviceId, pin, sessionIdState, setSessionId]);

	const refreshSessionId = useCallback(async (): Promise<string> => {
		if (!deviceId || !pin) throw new Error('Missing device credentials');
		const newSession = await authenticatePin({ deviceId, pin });
		setSessionId(newSession);
		return newSession;
	}, [deviceId, pin, setSessionId]);

	const createCredentialsWithValidatorSession = useCallback(
		async (validatorSessionId: string) => {
			// Generate new device credentials
			const newDeviceId = generateUuidV4();
			const newPin = generatePin4();
			// Create PIN on CBORD side using validator session id
			await createPin({ deviceId: newDeviceId, pin: newPin, sessionId: validatorSessionId });
			// Persist and set locally
			saveCredentials(newDeviceId, newPin);
			setDeviceId(newDeviceId);
			setPin(newPin);
			// Authenticate to get ongoing session id
			const newSessionId = await authenticatePin({ deviceId: newDeviceId, pin: newPin });
			setSessionId(newSessionId);
			return { deviceId: newDeviceId, pin: newPin, sessionId: newSessionId };
		},
		[],
	);

	const value = useMemo<AuthContextValue>(
		() => ({
			deviceId,
			pin,
			sessionId: sessionIdState,
			isAuthenticated: Boolean(deviceId && pin),
			setCredentials,
			clearCredentials,
			setSessionId,
			ensureSessionId,
			refreshSessionId,
			createCredentialsWithValidatorSession,
		}),
		[deviceId, pin, sessionIdState, setCredentials, clearCredentials, ensureSessionId, refreshSessionId, createCredentialsWithValidatorSession],
	);

	// Once a session id is present, retrieve the CBORD user id, hash it, and identify with PostHog.
	useEffect(() => {
		let aborted = false;
		async function run() {
			if (!sessionIdState) return;
			try {
				const rawUserId = await retrieveUserId({ sessionId: sessionIdState });
				if (aborted) return;
				const hashed = await sha256Hex(rawUserId);
				if (aborted) return;
				// Only associate a distinct id; no other tracking is enabled
				posthog.identify(hashed);
			} catch {
				// Ignore analytics failures entirely
			}
		}
		run();
		return () => {
			aborted = true;
		};
	}, [sessionIdState]);

	return <AuthContext.Provider value={value}>{props.children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
	const ctx = useContext(AuthContext);
	if (!ctx) throw new Error('useAuth must be used within AuthProvider');
	return ctx;
}


