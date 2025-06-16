// SPDX-FileCopyrightText: 2023 Alice Benatti <alice17bee@gmail.com>
// SPDX-FileCopyrightText: 2023 Erik <kocierik@gmail.com>
// SPDX-FileCopyrightText: 2023 Luca Tagliavini <luca@teapot.ovh>
// SPDX-FileCopyrightText: 2023 Stefano Volpe <stefano.volpe@student.uva.nl>
// SPDX-FileCopyrightText: 2023 Eyad Issa <eyadlorenzo@gmail.com>
// SPDX-FileCopyrightText: 2023 kocierik <kocierik@gmail.com>
// SPDX-FileCopyrightText: 2023 manuandru <34137244+manuandru@users.noreply.github.com>
// SPDX-FileCopyrightText: 2024 Samuele Musiani <samu@teapot.ovh>
//
// SPDX-License-Identifier: AGPL-3.0-or-later

import { getManifest } from '$lib/api';
import { filterAsync } from './filter';

export type Teaching = {
	name: string;
	url: string;
	chat?: string;
	website?: string;
	professors?: string[];
	degree?: string;
};

export type Year = {
	year: number;
	chat?: string;
};

export type DegreeTeaching = {
	name: string;
	year?: number;
	mandatory: boolean;
};

export type Degree = {
	id: string;
	name: string;
	icon: string;
	teachings?: DegreeTeaching[];
	years?: Year[];
	chat?: string;
};

async function isTeachingActiveFromName(fetch: typeof window.fetch, teaching: string) {
	try {
		await getManifest(fetch, teaching);
		return true;
	} catch {
		return false;
	}
}

export async function isTeachingActive(fetch: typeof window.fetch, teaching: Teaching) {
	return isTeachingActiveFromName(fetch, teaching.url);
}

export function teachingsFilter(d: Degree, year?: number, mandatory?: boolean): string[] {
	let res: string[] = [];

	d.teachings?.forEach((x) => {
		if (
			(year == undefined || (x.year && x.year == year) || (!x.year && year == 0)) &&
			(mandatory == undefined || x.mandatory == mandatory)
		) {
			res = res.concat(x.name);
		}
	});

	return res;
}

export async function getActiveTeachings(
	fetch: typeof window.fetch,
	degree: Degree
): Promise<string[]> {
	const years = degree.teachings;
	if (!years) return [];
	const allTeachings = teachingsFilter(degree);
	const activeTeachings = await filterAsync(allTeachings, (t) =>
		isTeachingActiveFromName(fetch, t)
	);

	return activeTeachings;
}

// TEACHINGS
import teachingsArray from '../config/teachings.json' assert { type: 'json' };

function teachingToIndexedTeaching(t: Teaching): [string, Teaching] {
	return [t.url, t];
}

const TEACHINGS = new Map<string, Teaching>(teachingsArray.map(teachingToIndexedTeaching));
export { TEACHINGS };

// DEGREES
import DEGREES from '../config/degrees.json' assert { type: 'Degree[]' };
export { DEGREES };
