// SPDX-FileCopyrightText: 2025 Alice Benatti <alice17bee@gmail.com>
//
// SPDX-License-Identifier: AGPL-3.0-or-later

import { redirect } from '@sveltejs/kit';
import type { PageLoad } from './$types';
import { auth } from '$lib/polleg.svelte';
import { LOGOUT_URL } from '$lib/const';

export const ssr = false;

export const load: PageLoad = async ({ url }) => {
	const redirect_uri = url.searchParams.get('redirect_uri');

	auth.current = { state: 'unauthenticated' };

	throw redirect(302, LOGOUT_URL(redirect_uri ? new URL(redirect_uri) : url));
};
