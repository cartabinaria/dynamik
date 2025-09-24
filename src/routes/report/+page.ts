// SPDX-FileCopyrightText: 2025 Eyad Issa <eyadlorenzo@gmail.com>
// SPDX-FileCopyrightText: 2025 Alice Benatti <alice17bee@gmail.com>
//
// SPDX-License-Identifier: AGPL-3.0-or-later

import { auth, checkAuth, isAuthenticated } from '$lib/stores/auth';
import { get } from 'svelte/store';
import type { PageLoad } from './$types';
import { ANSWERS_REPLIES_URL, BAN_URL, REPORTS_URL } from '$lib/const';
import { error } from '@sveltejs/kit';
import type { Report } from '$lib/polleg';

export const ssr = false;

async function getAnswerContent(fetch: typeof globalThis.fetch, answerId: number) {
	const res = await fetch(ANSWERS_REPLIES_URL(answerId), { credentials: 'include' });
	if (res.ok) {
		const answer = await res.json();
		return answer;
	} else {
		console.error('Failed to fetch answers:', res.statusText);
		return 'Error fetching answer';
	}
}

export const load: PageLoad = async ({ fetch }) => {
	await checkAuth(fetch);

	if (!isAuthenticated(get(auth))) {
		error(401, 'User not authenticated');
	}

	const reportsPromise = (async () => {
		const reportsRes = await fetch(REPORTS_URL, {
			credentials: 'include'
		});

		if (!reportsRes.ok) {
			throw new Error('Failed to fetch reports');
		}

		const reports = (await reportsRes.json()) as Report[];

		await Promise.all(
			reports.map(
				async (_, i) => (reports[i].answer = await getAnswerContent(fetch, reports[i].answer_id))
			)
		);

		return reports as Report[];
	})();

	const bannedPromise = (async () => {
		const resban = await fetch(BAN_URL, { credentials: 'include' });
		if (!resban.ok) {
			throw new Error('Failed to fetch banned users');
		}
		const banned = await resban.json();
		return banned as Array<{ username: string; user_avatar_url: string; banned_at: string }>;
	})();

	try {
		const [reports, banned] = await Promise.all([reportsPromise, bannedPromise]);
		return { reports, banned };
	} catch (err) {
		console.error('Error loading data:', err);
		error(500, 'Failed to load data');
	}
};
