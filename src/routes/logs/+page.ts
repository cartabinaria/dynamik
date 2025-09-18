import { auth, checkAuth, isAuthenticated } from '$lib/stores/auth';
import { get } from 'svelte/store';
import type { PageLoad } from './$types';
import { error } from '@sveltejs/kit';
import { LOGS_URL } from '$lib/const';
import type { Logs } from '$lib/polleg';

export const ssr = false;

export const load: PageLoad = async ({ fetch }) => {
	await checkAuth(fetch); // refresh auth state

	const authState = get(auth);

	if (!isAuthenticated(authState)) {
		error(401, 'User not authenticated');
	}

	const logsRes = await fetch(LOGS_URL, { credentials: 'include' });
	if (!logsRes.ok) {
		error(logsRes.status, 'Failed to fetch logs');
	}

	const logs: Logs[] = await logsRes.json();
	return { logs };
};
