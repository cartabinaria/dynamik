// SPDX-FileCopyrightText: 2025 Eyad Issa <eyadlorenzo@gmail.com>
//
// SPDX-License-Identifier: AGPL-3.0-or-later

import { redirect } from '@sveltejs/kit';
import type { PageLoad } from './$types';
import { auth, fetchWhoAmI, isAuthenticated, wrapWithAuth } from '$lib/stores/auth';
import { get } from 'svelte/store';
import { LOGIN_URL } from '$lib/const';

export const ssr = false;

export const load: PageLoad = async ({ url, fetch }) => {
	const session_token = url.searchParams.get('session_token');
	const return_to = url.searchParams.get('return_to');

	// If the user is already authenticated, redirect to the home page
	const authStatus = get(auth);
	if (isAuthenticated(authStatus)) {
		throw redirect(302, '/');
	}

	// If the url contains a session_token parameter, query the whoami endpoint,
	// save it to the auth store and redirect to the home page
	if (session_token) {
		const authedFetch = wrapWithAuth(fetch, session_token);
		const whoami = await fetchWhoAmI(authedFetch);
		if (!('error' in whoami)) {
			auth.set({ state: 'authenticated', session_token, user: whoami });
			throw redirect(302, return_to || '/');
		}
	}

	// Otherwise, redirect to the login page
	throw redirect(302, LOGIN_URL(url));
};
