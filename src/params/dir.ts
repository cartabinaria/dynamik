import type { ParamMatcher } from '@sveltejs/kit';
import { match as generic } from './generic';

export const match: ParamMatcher = (path) => !generic(path);
