import type { ParamMatcher } from '@sveltejs/kit';

export const match: ParamMatcher = (param) => /^.+\.pdf$/.test(param);
