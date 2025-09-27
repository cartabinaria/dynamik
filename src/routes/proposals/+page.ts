import { error } from '@sveltejs/kit';

import { auth, createPollegWithAuth, refreshAuth } from '$lib/polleg.svelte';
import type { PageLoad } from './$types';

export const ssr = false;

export const load: PageLoad = async () => {
	await refreshAuth(fetch);
	if (!('user' in auth.current && ['admin', 'member'].includes(auth.current.user?.role))) {
		error(401, 'User not authorized');
	}

	const polleg = createPollegWithAuth(fetch);
	if (!polleg) {
		error(401, 'User not authenticated');
	}

	const { data: proposals, error: err } = await polleg.getProposals();
	if (err || !proposals) {
		error(500, 'Failed to fetch proposals');
	}

	return { proposals: proposals };
};
