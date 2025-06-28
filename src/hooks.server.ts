import type { Handle } from '@sveltejs/kit';
import {
	getGithubAccessToken,
	getGithubRefreshToken,
	setGithubTokens
} from '$lib/server/sessionStore';
import { Octokit } from 'octokit';

export const handle: Handle = async ({ event, resolve }) => {
	let accessToken = getGithubAccessToken(event.cookies);
	const refreshToken = getGithubRefreshToken(event.cookies);

	// Always try to refresh if we have a refresh token
	if (refreshToken) {
		const octokit = new Octokit();
		const tokenRes = await octokit.request('POST /login/oauth/access_token', {
			client_id: process.env.GITHUB_APP_ID,
			client_secret: process.env.GITHUB_APP_SECRET,
			grant_type: 'refresh_token',
			refresh_token: refreshToken,
			headers: {
				Accept: 'application/json'
			}
		});
		const tokenData = tokenRes.data;
		if (tokenData.access_token) {
			setGithubTokens(event.cookies, tokenData.access_token, tokenData.refresh_token);
			accessToken = tokenData.access_token;
		}
	}

	event.locals.github_access_token = accessToken;

	return resolve(event);
};
