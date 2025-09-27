// SPDX-FileCopyrightText: 2025 Eyad Issa <eyadlorenzo@gmail.com>
//
// SPDX-License-Identifier: AGPL-3.0-or-later

import { error, redirect } from '@sveltejs/kit';
import type { PageLoad } from './$types';
import { auth, createPolleg, isAuthenticated } from '$lib/polleg.svelte';
import { LOGIN_URL } from '$lib/const';

export const ssr = false;

export const load: PageLoad = async ({ url, fetch }) => {
  const session_token = url.searchParams.get('session_token');
  const return_to = url.searchParams.get('redirect_uri');

  // If the user is already authenticated, redirect to the home page
  const authStatus = auth.current;
  if (isAuthenticated(authStatus)) {
    throw redirect(302, '/');
  }

  // If the url contains a session_token parameter, query the whoami endpoint,
  // save it to the auth store and redirect to the home page
  if (session_token) {
    const polleg = createPolleg(fetch, session_token);
    const { data: whoami, error: err } = await polleg.whoAmI();
    if (err || !whoami || 'error' in whoami) {
      error(401, 'Invalid session token');
    }
    // If the whoami request was successful, save the user to the auth store
    // and redirect to the home page or to the return_to parameter
    // if it was provided
    auth.current = { state: 'authenticated', session_token, user: whoami };
    throw redirect(302, return_to || '/');
  }

  // Otherwise, redirect to the login page
  const redirectUrl = new URL(url);
  if (return_to) {
    redirectUrl.searchParams.set('redirect_uri', return_to);
  }

  throw redirect(302, LOGIN_URL(encodeURIComponent(redirectUrl.toString())));
};
