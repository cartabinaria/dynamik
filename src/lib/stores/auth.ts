import { WHOAMI_URL, LOGOUT_URI } from '$lib/const';
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

interface Whoami {
	username: string;
	avatarUrl: string;
	name: string;
	email: string;
	admin: boolean;
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

export const logout = async (url?: string) => {
	if (url) {
		await fetch(LOGOUT_URI(url), { credentials: 'include' });
	}
	store.set(defaultState);
};

export const auth = store;
