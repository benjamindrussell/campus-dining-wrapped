export function generateUuidV4(): string {
	// Prefer native when available
	// Some mobile browsers (older Safari) don't support crypto.randomUUID
	const native = (globalThis as any)?.crypto?.randomUUID;
	if (typeof native === 'function') {
		return native.call((globalThis as any).crypto).toUpperCase();
	}
	// Fallback: RFC 4122 compliant v4 using (crypto.)getRandomValues if available
	const cryptoObj: Crypto | undefined = (globalThis as any)?.crypto;
	const getRandomValues =
		typeof cryptoObj?.getRandomValues === 'function'
			? (len: number) => {
					const bytes = new Uint8Array(len);
					cryptoObj!.getRandomValues(bytes);
					return bytes;
				}
			: (len: number) => {
					// Last-resort non-crypto fallback; acceptable for device IDs in this context
					const bytes = new Uint8Array(len);
					for (let i = 0; i < len; i++) bytes[i] = Math.floor(Math.random() * 256);
					return bytes;
				};
	const bytes = getRandomValues(16);
	// Per RFC 4122 §4.4
	bytes[6] = (bytes[6] & 0x0f) | 0x40;
	bytes[8] = (bytes[8] & 0x3f) | 0x80;
	const hex: string[] = Array.from(bytes, (b) => b.toString(16).padStart(2, '0'));
	const id = `${hex[0]}${hex[1]}${hex[2]}${hex[3]}-${hex[4]}${hex[5]}-${hex[6]}${hex[7]}-${hex[8]}${hex[9]}-${hex[10]}${hex[11]}${hex[12]}${hex[13]}${hex[14]}${hex[15]}`;
	return id.toUpperCase();
}

export function generatePin4(): string {
	const n = Math.floor(Math.random() * 10000);
	return n.toString().padStart(4, '0');
}