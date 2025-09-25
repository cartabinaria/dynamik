// SPDX-FileCopyrightText: 2025 Alice Benatti <alice17bee@gmail.com>
// SPDX-FileCopyrightText: 2025 Eyad Issa <eyadlorenzo@gmail.com>
//
// SPDX-License-Identifier: AGPL-3.0-or-later

import type { PageLoad } from './$types';
import { error } from '@sveltejs/kit';
import { createPollegWithAuth, refreshAuth } from '$lib/polleg.svelte';

export const ssr = false;

export const load: PageLoad = async ({ fetch }) => {
	await refreshAuth(fetch);
	const polleg = createPollegWithAuth(fetch);
	if (!polleg) {
		error(401, 'User not authenticated');
	}

	const { data, error: err } = await polleg.getLogs();
	if (err || !data) {
		error(500, 'Failed to fetch logs');
	}

	return { logs: data };
};
