export const STORAGE_KEYS = {
	deviceId: 'cdw_deviceId',
	pin: 'cdw_pin',
	sessionId: 'cdw_sessionId',
} as const;

export function saveCredentials(deviceId: string, pin: string): void {
	localStorage.setItem(STORAGE_KEYS.deviceId, deviceId);
	localStorage.setItem(STORAGE_KEYS.pin, pin);
}

export function loadCredentials(): { deviceId: string; pin: string } | null {
	const deviceId = localStorage.getItem(STORAGE_KEYS.deviceId);
	const pin = localStorage.getItem(STORAGE_KEYS.pin);
	if (!deviceId || !pin) return null;
	return { deviceId, pin };
}

export function clearCredentials(): void {
	localStorage.removeItem(STORAGE_KEYS.deviceId);
	localStorage.removeItem(STORAGE_KEYS.pin);
}

export function saveSessionId(sessionId: string): void {
	localStorage.setItem(STORAGE_KEYS.sessionId, sessionId);
}

export function loadSessionId(): string | null {
	return localStorage.getItem(STORAGE_KEYS.sessionId);
}

export function clearSessionId(): void {
	localStorage.removeItem(STORAGE_KEYS.sessionId);
}


