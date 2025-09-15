/*
SPDX-FileCopyrightText: 2024 Luca Tagliavini <luca@teapot.ovh>
SPDX-FileCopyrightText: 2025 Alice Benatti <alice17bee@gmail.com>

SPDX-License-Identifier: AGPL-3.0-or-later
*/

import { WHOAMI_URL } from '$lib/const';
import { writable } from 'svelte/store';

export const AUTHENTICATED = 'authenticated';
export const UNAUTHENTICATED = 'unauthenticated';

interface AuthenticatedState {
	state: 'authenticated';
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

interface Error {
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

export const checkAuth = async () => {
	const req = await fetch(WHOAMI_URL, { credentials: 'include' });
	const res: Whoami | Error = await req.json();
	if (!('error' in res)) {
		const state: AuthenticatedState = {
			state: 'authenticated',
			user: res
		};
		store.set(state);
	}
};

export const auth = store;
