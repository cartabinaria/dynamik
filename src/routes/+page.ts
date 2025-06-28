import type { PageLoad } from './$types';

import { DEGREES } from '$lib/teachings';

export const ssr = false;

export const load: PageLoad = () => {
	return { degrees: DEGREES };
};
