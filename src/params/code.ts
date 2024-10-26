import type { ParamMatcher } from '@sveltejs/kit';
import { bundledLanguagesInfo } from 'shiki/langs';

const IGNORED_LANGUAGES = ['md', 'html'];

const EXTRA_BUNDLED_LANGUAGES = [
	...bundledLanguagesInfo.map((info) => [info.id, ...(info.aliases || [])]).flat(),
	'txt',
	'c++',
	'tsx',
	'jsx',
	'hdl'
];

export const match: ParamMatcher = (file) => {
	const parts = file.split('.');
	const extention = parts.pop();
	if (extention == null) {
		return false;
	}

	return EXTRA_BUNDLED_LANGUAGES.includes(extention) && !IGNORED_LANGUAGES.includes(extention);
};
