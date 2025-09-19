// SPDX-FileCopyrightText: 2023 Luca Tagliavini <luca@teapot.ovh>
// SPDX-FileCopyrightText: 2023 Stefano Volpe <stefano.volpe@student.uva.nl>
// SPDX-FileCopyrightText: 2023 Eyad Issa <eyadlorenzo@gmail.com>
//
// SPDX-License-Identifier: AGPL-3.0-or-later

import { getFuzzy, getManifest } from '$lib/api';
import { APPROVE_DOCUMENTS_URL, DOCUMENTS_URL } from '$lib/const';
import { DEGREES, TEACHINGS } from '$lib/teachings';
import sha256 from 'sha256';
import type { PageLoad } from './$types';

async function isPollegDocument(filePath: string) {
	try {
		const res = await fetch(`${DOCUMENTS_URL}?path=/${filePath}`, {
			method: 'GET',
			credentials: 'include'
		});
		let data = await res.json();
		data = data.map((doc: string) => doc.slice(filePath.length + 2));
		return data;
	} catch (e) {
		console.error(e);
	}
}

export const load: PageLoad = async ({ fetch, params, url }) => {
	// Get the relative path using params
	const path = params.dir ? params.dir + '/' + params.zfile : params.zfile;

	// Load the manifest
	const manifest = await getManifest(fetch, path);

	// Load the fuzzy search index
	const fuzzyPath = path.split('/').slice(0, 1).join('/');
	const fuzzy = await getFuzzy(fetch, fuzzyPath);

	const from = url.searchParams.get('from');
	const isPolleg = await isPollegDocument(path);

	return {
		degrees: DEGREES,
		manifest,
		fuzzy,
		from,
		teachings: TEACHINGS,
		isPolleg
	};
};
