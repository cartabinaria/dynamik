// SPDX-FileCopyrightText: 2025 Eyad Issa <eyadlorenzo@gmail.com>
// SPDX-FileCopyrightText: 2025 Alice Benatti <alice17bee@gmail.com>
//
// SPDX-License-Identifier: AGPL-3.0-or-later

import { refreshAuth, createPollegWithAuth } from '$lib/polleg.svelte';
import type { PageLoad } from './$types';
import { error } from '@sveltejs/kit';
import type { Report } from '$lib/polleg.svelte';

export const ssr = false;

export const load: PageLoad = async ({ fetch }) => {
	await refreshAuth(fetch);

	const polleg = createPollegWithAuth(fetch);
	if (!polleg) {
		error(401, 'User not authenticated');
	}

	const reports = await (async () => {
		const { data: reports, error: err } = await polleg.getReports();
		if (err || !reports) {
			throw new Error('Failed to fetch reports');
		}

		await Promise.all(
			reports.map(async (_, i) => {
				const { data } = await polleg.getAnswerContent(reports[i].answer_id);
				if (data) {
					reports[i].answer = data;
				}
			})
		);

		return reports as Report[];
	})();

	const { data: banned, error: bannedError } = await polleg.getBanned();
	if (bannedError || !banned) {
		throw error(500, 'Failed to fetch banned users');
	}

	return { reports, banned };
};
