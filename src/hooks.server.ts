import type { Handle } from '@sveltejs/kit';
import { getGithubAccessToken, getGithubRefreshToken, setGithubTokens } from '$lib/server/sessionStore';

export const handle: Handle = async ({ event, resolve }) => {
	let accessToken = getGithubAccessToken(event.cookies);
	const refreshToken = getGithubRefreshToken(event.cookies);

	// If no access token but we have a refresh token, try to refresh
	if (!accessToken && refreshToken) {
		const tokenRes = await event.fetch('https://github.com/login/oauth/access_token', {
			method: 'POST',
			headers: {
				Accept: 'application/json',
				'Content-Type': 'application/json'
			},
			body: JSON.stringify({
				client_id: process.env.GITHUB_APP_ID,
				client_secret: process.env.GITHUB_APP_SECRET,
				grant_type: 'refresh_token',
				refresh_token: refreshToken
			})
		});
		const tokenData = await tokenRes.json();
		if (tokenData.access_token) {
			setGithubTokens(event.cookies, tokenData.access_token, tokenData.refresh_token);
			accessToken = tokenData.access_token;
		}
	}

	event.locals.github_access_token = accessToken;

	return resolve(event);
};
