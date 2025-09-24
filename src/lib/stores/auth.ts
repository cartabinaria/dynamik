// SPDX-FileCopyrightText: 2024 Luca Tagliavini <luca@teapot.ovh>
// SPDX-FileCopyrightText: 2025 Alice Benatti <alice17bee@gmail.com>
// SPDX-FileCopyrightText: 2025 Eyad Issa <eyadlorenzo@gmail.com>
//
// SPDX-License-Identifier: AGPL-3.0-or-later

import { browser } from '$app/environment';
import { WHOAMI_URL } from '$lib/const';
import { get, writable } from 'svelte/store';

export const AUTHENTICATED = 'authenticated';
export const UNAUTHENTICATED = 'unauthenticated';

interface AuthenticatedState {
	state: 'authenticated';
	session_token: string;
	user: Whoami;
}

interface UnauthenticatedState {
	state: 'unauthenticated';
}

export type AuthState = AuthenticatedState | UnauthenticatedState;

export const isAuthenticated = (state: AuthState): state is AuthenticatedState => {
	return state.state === 'authenticated';
};

const defaultState: UnauthenticatedState = {
	state: 'unauthenticated'
};

interface ApiError {
	error: string;
}

type Role = 'admin' | 'member' | 'user';

interface Whoami {
	username: string;
	avatarUrl: string;
	name: string;
	email: string;
	role: Role;
}

const store = writable<AuthState>(defaultState);

export async function checkAuth(fetch: typeof window.fetch) {
	if (!browser) throw new Error('checkAuth can only be called in the browser');

	const authState = get(store);
	if (!isAuthenticated(authState)) return;

	const wrappedFetch = wrapWithAuth(fetch, authState.session_token);
	const res = await fetchWhoAmI(wrappedFetch);
	if (!('error' in res)) {
		const state: AuthenticatedState = {
			...authState,
			state: 'authenticated',
			user: res
		};
		store.set(state);
	}
}

export const auth = store;

export function wrapWithAuth(fetch: typeof window.fetch = window.fetch, token: string) {
	return (input: RequestInfo | URL, init?: RequestInit) =>
		fetch(input, {
			...init,
			headers: { ...init?.headers, Authorization: `${token}` }
		});
}

export function fetchWhoAmI(fetch: typeof window.fetch) {
	return fetch(WHOAMI_URL).then((res) => res.json()) as Promise<Whoami | ApiError>;
}
