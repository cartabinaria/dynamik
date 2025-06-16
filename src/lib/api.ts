// SPDX-FileCopyrightText: 2023 Luca <luca.tagliavini5@studio.unibo.it>
// SPDX-FileCopyrightText: 2023 VaiTon <eyadlorenzo@gmail.com>
//
// SPDX-License-Identifier: AGPL-3.0-or-later

import { FUZZY_URL, STATIK_URL } from '$lib/const';

export interface Statik extends Directory {
	directories?: Directory[];
	files?: File[];
}

export interface Directory {
	name: string;
	path: string;
	size: string;
	time: string;
	url: string;
}

export interface File extends Directory {
	mime: string;
}

export type Fuzzy = FuzzyFile[];

export interface FuzzyFile {
	mime: string;
	name: string;
	path: string;
	url: string;
}
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
