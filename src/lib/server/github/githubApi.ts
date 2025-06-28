/**
 * Utility functions for interacting with the GitHub API.
 * Each function accepts a `fetch` argument for SSR compatibility and testability.
 */

import { Octokit } from 'octokit';

export interface GitHubUser {
	login: string;
	id: number;
	avatar_url: string;
	html_url: string;
	name?: string;
	email?: string;
	// Add more fields as needed
}

export interface GitHubAccessTokenResponse {
	access_token: string;
	refresh_token?: string;
	token_type: string;
	scope: string;
}

export async function exchangeCodeForToken({
	code,
	code_verifier,
	client_id,
	client_secret,
	redirect_uri,
	fetch
}: {
	code: string;
	code_verifier: string;
	client_id: string;
	client_secret: string;
	redirect_uri: string;
	fetch: typeof globalThis.fetch;
}): Promise<GitHubAccessTokenResponse> {
	const res = await fetch('https://github.com/login/oauth/access_token', {
		method: 'POST',
		headers: {
			Accept: 'application/json',
			'Content-Type': 'application/json'
		},
		body: JSON.stringify({
			client_id,
			client_secret,
			code,
			redirect_uri,
			grant_type: 'authorization_code',
			code_verifier
		})
	});
	if (!res.ok) {
		throw new Error('Failed to exchange code for access token');
	}
	return res.json();
}

export async function getUserInfo({
	access_token,
	fetch
}: {
	access_token: string;
	fetch: typeof globalThis.fetch;
}): Promise<GitHubUser> {
	const res = await fetch('https://api.github.com/user', {
		headers: {
			Authorization: `Bearer ${access_token}`,
			Accept: 'application/json',
			'User-Agent': 'SvelteKit OAuth App'
		}
	});
	if (!res.ok) {
		throw new Error('Failed to fetch GitHub user info: ' + res.statusText);
	}
	return res.json();
}

/**
 * Fetches the list of folders (directories) in the root of a GitHub repository.
 * Uses the public GitHub API (client-side, unauthenticated).
 */
export async function fetchRepoFolders({
	fetch,
	token,
	owner,
	repo
}: {
	fetch: typeof globalThis.fetch;
	token: string;
	owner: string;
	repo: string;
}) {
	const octokit = new Octokit({ auth: token, request: { fetch } });

	const res = await octokit.request('GET /repos/{owner}/{repo}/contents', {
		owner,
		repo
	});

	if (!res || !res.data) {
		throw new Error('Failed to fetch repository contents');
	}

	const data = res.data;
	return Array.isArray(data) ? data.filter((item: { type: string }) => item.type === 'dir') : [];
}
