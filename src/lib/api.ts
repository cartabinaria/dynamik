import { FUZZY_URL, STATIK_URL } from '$lib/const';

export type StatikEntry = {
	name: string;
	path: string;
	size: string;
	time: string;
	url: string;
};

export type Directory = StatikEntry;

export type Statik = Directory & {
	directories?: Directory[];
	files?: File[];
};

export type File = Directory & {
	mime: string;
};

export type FuzzyFile = {
	mime: string;
	name: string;
	path: string;
	url: string;
};

export type Fuzzy = FuzzyFile[];

export async function getManifest(fetch: typeof window.fetch, path: string): Promise<Statik> {
	const res = await fetch(STATIK_URL(path));
	if (!res.ok) {
		throw new Error(`Failed to load manifest at ${STATIK_URL(path)}`);
	}
	const manifest: Statik = await res.json();
	return manifest;
}

export async function getFuzzy(fetch: typeof window.fetch, path: string): Promise<Fuzzy> {
	const res = await fetch(FUZZY_URL(path));
	if (!res.ok) {
		console.error(`Failed to load fuzzy at ${FUZZY_URL(path)}`);
		return [];
	}
	return await res.json();
}
