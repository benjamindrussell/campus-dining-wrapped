import type { Transaction } from './types';

function canonicalizeLocationName(rawName: string): string | null {
	if (!rawName) return null;
	const name = rawName.toLowerCase();

	// Exclusions
	if (
		name.includes('papercut') ||
		name.includes('dining services') ||
		name.includes('deposit') ||
		name.includes('get location') ||
		name.includes('card services')
	) {
		return null;
	}

	// Specific mappings (order matters)
	if (name.includes('blend express') || name.includes('blendexpress')) return 'The Blend Express';
	if (name.includes('blend') && !name.includes('express')) return 'The Blend';
	if (name.includes('emporium')) return 'The Emporium';
	if (name.includes('art street') || name.includes('artstreet')) return 'ArtStreet Café';
	if (name.includes('toss')) return 'Toss';
	if (name.includes('fly by') || name.includes('flyby')) return 'Fly By';
	if (name.includes('heritage')) return 'Heritage Coffeehouse';
	if (name.includes('marycrest')) return 'Marycrest';
	if (name.includes('vwk') || name.includes('virginia')) return 'VWK';
	if (name.includes('aubonpain') || name.includes('au bon pain') || name.includes('abp'))
		return 'Au Bon Pain';
	if (name.includes('landing')) return 'Stu’s Landing';
	if (name.includes('que')) return '‘Que';
	if (name.includes('spice')) return 'Spice';
	if (name.includes('thechill') || name.includes('the chill')) return 'The CHILL';
	if (name.includes('bistro')) return 'Brown Street Bistro';

	// Default: keep original
	return rawName;
}

export function normalizeTransactions(transactions: Transaction[]): Transaction[] {
	if (!transactions || transactions.length === 0) return [];
	const normalized: Transaction[] = [];
	for (const t of transactions) {
		const canonical = canonicalizeLocationName(t.locationName);
		if (canonical === null) continue; // excluded
		normalized.push({ ...t, locationName: canonical });
	}
	return normalized;
}


