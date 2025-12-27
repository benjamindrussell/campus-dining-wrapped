export function generateUuidV4(): string {
	return crypto.randomUUID().toUpperCase(); 
}

export function generatePin4(): string {
	const n = Math.floor(Math.random() * 10000);
	return n.toString().padStart(4, '0');
}