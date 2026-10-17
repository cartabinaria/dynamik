// SPDX-FileCopyrightText: 2023 - 2024 Eyad Issa <eyadlorenzo@gmail.com>
// SPDX-FileCopyrightText: 2023 Luca Tagliavini <luca@teapot.ovh>
//
// SPDX-License-Identifier: AGPL-3.0-or-later

import { defineParams } from '@sveltejs/kit/params';
import { bundledLanguagesInfo } from 'shiki/langs';

const matchAsciidoc = (param: string) => /^.+\.(asciidoc|adoc)$/.test(param);

const IGNORED_LANGUAGES = ['md', 'html'];

const EXTRA_BUNDLED_LANGUAGES = [
	...bundledLanguagesInfo.map((info) => [info.id, ...(info.aliases || [])]).flat(),
	'txt',
	'c++',
	'tsx',
	'jsx',
	'hdl'
];

const matchCode = (file: string) => {
	const parts = file.split('.');

	if (parts.length < 2) {
		return false;
	}

	const extention = parts.pop();

	if (extention == null) {
		return false;
	}

	return EXTRA_BUNDLED_LANGUAGES.includes(extention) && !IGNORED_LANGUAGES.includes(extention);
};

const matchDir = (path: string) => !matchGeneric(path);

const matchGeneric = (file: string) => {
	return /^.+\.[a-z0-9]+$/.test(file);
};

const matchMarkdown = (param: string) => /^.+\.md$/.test(param);

const matchPdf = (param: string) => /^.+\.pdf$/.test(param);

export const params = defineParams({
	asciidoc: (param) => (matchAsciidoc(param) ? param : undefined),
	code: (param) => (matchCode(param) ? param : undefined),
	dir: (param) => (matchDir(param) ? param : undefined),
	generic: (param) => (matchGeneric(param) ? param : undefined),
	markdown: (param) => (matchMarkdown(param) ? param : undefined),
	pdf: (param) => (matchPdf(param) ? param : undefined)
});
