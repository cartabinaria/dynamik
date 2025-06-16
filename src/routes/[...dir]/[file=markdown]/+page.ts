// SPDX-FileCopyrightText: 2023 Eyad Issa <eyadlorenzo@gmail.com>
//
// SPDX-License-Identifier: AGPL-3.0-or-later

import type { PageLoad } from './$types';
import { ASSET_URL } from '$lib/const';
import { marked } from 'marked';
import type { Statik } from '$lib/api';
import DOMPurify from 'dompurify';

export const ssr = false;

async function fileInfo(fetch: typeof window.fetch, params: { dir: string; file: string }) {
	const res = await fetch(ASSET_URL(params.dir + '/statik.json'));
	const json = (await res.json()) as Statik;

	const file = json.files?.find((file) => file.name === params.file);
	if (file == null) {
		throw new Error(`File not found: ${params.dir}/${params.file}`);
	}

	return file;
}

export const load = (async ({ fetch, params }) => {
	const fileContentReq = await fetch(ASSET_URL(params.dir + '/' + params.file));
	const fileContent = await fileContentReq.text();
	const mdRendered = await marked(fileContent, { async: true });

	const clean = DOMPurify.sanitize(mdRendered);

	return {
		markdown: clean,
		info: { fileInfo: fileInfo(fetch, params) }
	};
}) satisfies PageLoad;
