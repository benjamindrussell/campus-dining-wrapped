import { createContext, useCallback, useContext, useMemo, useState } from 'react';
import { authenticatePin, createPin } from '../lib/api';
import { loadCredentials, saveCredentials, clearCredentials as clearStored } from '../lib/storage';
import { generatePin4, generateUuidV4 } from '../lib/ids';

type AuthContextValue = {
	deviceId: string | null;
	pin: string | null;
	sessionId: string | null;
	isAuthenticated: boolean;
	setCredentials: (deviceId: string, pin: string) => void;
	clearCredentials: () => void;
	setSessionId: (sessionId: string | null) => void;
	ensureSessionId: () => Promise<string>;
	createCredentialsWithValidatorSession: (validatorSessionId: string) => Promise<{ deviceId: string; pin: string; sessionId: string }>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider(props: { children: React.ReactNode }) {
	const existing = loadCredentials();
	const [deviceId, setDeviceId] = useState<string | null>(existing?.deviceId ?? null);
	const [pin, setPin] = useState<string | null>(existing?.pin ?? null);
	const [sessionId, setSessionId] = useState<string | null>(null);

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
		if (sessionId) return sessionId;
		if (!deviceId || !pin) throw new Error('Missing device credentials');
		const newSession = await authenticatePin({ deviceId, pin });
		setSessionId(newSession);
		return newSession;
	}, [deviceId, pin, sessionId]);

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
			sessionId,
			isAuthenticated: Boolean(deviceId && pin),
			setCredentials,
			clearCredentials,
			setSessionId,
			ensureSessionId,
			createCredentialsWithValidatorSession,
		}),
		[deviceId, pin, sessionId, setCredentials, clearCredentials, ensureSessionId, createCredentialsWithValidatorSession],
	);

	return <AuthContext.Provider value={value}>{props.children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
	const ctx = useContext(AuthContext);
	if (!ctx) throw new Error('useAuth must be used within AuthProvider');
	return ctx;
}


