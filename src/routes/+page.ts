import type { PageLoad } from './$types';

import { DEGREES } from '$lib/teachings';

export const load: PageLoad = async () => {
	return { degrees: DEGREES };
};
