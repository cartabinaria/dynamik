/*
SPDX-FileCopyrightText: 2024 geno <gabriele.genovese2@studio.unibo.it>
SPDX-FileCopyrightText: 2024 Luca Tagliavini <luca@teapot.ovh>
SPDX-FileCopyrightText: 2025 Alice Benatti <alice17bee@gmail.com>

SPDX-License-Identifier: AGPL-3.0-or-later
*/

import { browser } from '$app/environment';
import {
	ANSWERS_REPLIES_URL,
	BAN_URL,
	LOGS_URL,
	PROPOSAL_URL,
	REPORT_URL,
	REPORTS_URL
} from './const';

import { WHOAMI_URL } from '$lib/const';
import { persistedState } from '$lib/persisted.svelte';

export interface Answer {
	id: number;
	created_at: string;
	updated_at: string;

	user: string;
	username?: string;
	user_avatar_url?: string;
	content: string;
	upvotes: number;
	downvotes: number;
	count: number;
	vote?: number;
	replies: Answer[];
	can_i_delete?: boolean;
}

export interface Question {
	id: number;
	created_at: string;
	updated_at: string;
	document: string;
	document_path?: string;
	start: number;
	end: number;
	counter: number;
	answers: Answer[];
	username?: string;
	user_avatar_url?: string;
}

export interface Document {
	id: string;
	questions: Question[];
	url: string;
}

export interface Proposal {
	id: number;
	questions: Question[];
	document_path: string;
}

export interface Logs {
	timestamp: string;
	action: string;
	item_type: string;
	item_id: string;
	username: string;
	user_avatar_url: string;
}

export interface Report {
	id: number;
	cause: string;
	created_at: string;
	username: string;
	user_avatar_url: string;
	answer_id: number;
	answer: Answer;
}

export type BannedUser = {
	username: string;
	user_avatar_url: string;
	banned_at: string;
};

export const AUTHENTICATED = 'authenticated';
export const UNAUTHENTICATED = 'unauthenticated';

type AuthenticatedState = {
	state: 'authenticated';
	session_token: string;
	user: Whoami;
};

type UnauthenticatedState = {
	state: 'unauthenticated';
};

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

// This is a function because otherwise it would be initialized on the server
export const auth = persistedState<AuthState>('polleg', defaultState, {
	storage: 'local'
});

export function createPolleg(fetch: typeof window.fetch, session_token: string) {
	return new Polleg(fetch, session_token);
}

export function createPollegWithAuth(fetch: typeof window.fetch) {
	if (!browser) return null;
	const authState = auth.current;
	if (!isAuthenticated(authState)) throw new Error('User is not authenticated');
	return createPolleg(fetch, authState.session_token);
}

function wrapFetch(fetch: typeof window.fetch, session_token: string) {
	return (input: RequestInfo | URL, init?: RequestInit) =>
		fetch(input, {
			...init,
			headers: { ...init?.headers, Authorization: `${session_token}` }
		});
}

export async function refreshAuth(fetch: typeof window.fetch) {
	if (!browser) return;
	const authState = auth.current;
	if (isAuthenticated(authState)) {
		const polleg = createPolleg(fetch, authState.session_token);
		const { data, error } = await polleg.whoAmI();
		if (error || !data) {
			auth.current = { state: 'unauthenticated' };
			return;
		}
		auth.current = { state: 'authenticated', session_token: authState.session_token, user: data };
	}
}

type PollegResponse<T> = { data: T; error?: never } | { data?: never; error: string };

class Polleg {
	private readonly fetch: typeof window.fetch;

	constructor(fetch: typeof window.fetch, session_token: string) {
		this.fetch = wrapFetch(fetch, session_token);
	}

	private pollegFetch = async <T>(
		path: string,
		options?: RequestInit
	): Promise<PollegResponse<T>> => {
		const res = await this.fetch(path, options);
		if (!res.ok) {
			return { error: `Failed to fetch ${path}: ${res.status} ${res.statusText}` };
		}
		const data = (await res.json()) as T;
		return { data };
	};

	getLogs = () => this.pollegFetch<Logs[]>(LOGS_URL);
	getProposals = () => this.pollegFetch<Proposal[]>(PROPOSAL_URL);
	getProposal = (id: number) => this.pollegFetch<Proposal | ApiError>(`${PROPOSAL_URL}/${id}`);
	whoAmI = () => this.pollegFetch<Whoami>(WHOAMI_URL);
	getBanned = () => this.pollegFetch<BannedUser[]>(BAN_URL);
	getAnswerContent = async (answerId: number) =>
		this.pollegFetch<Answer>(ANSWERS_REPLIES_URL(answerId));
	getReports = () => this.pollegFetch<Report[]>(REPORTS_URL);
	getReport = (id: number) => this.pollegFetch<Report | ApiError>(REPORT_URL(id));
}
