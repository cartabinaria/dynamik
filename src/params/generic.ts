import type { ParamMatcher } from '@sveltejs/kit';

export const match: ParamMatcher = (file) => {
	return /^.+\.[a-z0-9]+$/.test(file);
};
