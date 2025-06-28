import type { Cookies } from '@sveltejs/kit';

// Name of the GitHub session cookies
export const GITHUB_ACCESS_TOKEN_COOKIE = 'github_access_token';
export const GITHUB_REFRESH_TOKEN_COOKIE = 'github_refresh_token';

// Set the GitHub session cookies for access and refresh tokens
export function setGithubTokens(
	cookies: Cookies,
	accessToken: string,
	refreshToken?: string,
	options?: Partial<Parameters<Cookies['set']>[2]>
) {
	cookies.set(GITHUB_ACCESS_TOKEN_COOKIE, accessToken, {
		path: '/',
		httpOnly: true,
		sameSite: 'strict',
		secure: true,
		maxAge: 60 * 60 * 24 * 7, // 1 week
		...(options || {})
	});
	if (refreshToken) {
		cookies.set(GITHUB_REFRESH_TOKEN_COOKIE, refreshToken, {
			path: '/',
			httpOnly: true,
			sameSite: 'strict',
			secure: true,
			maxAge: 60 * 60 * 24 * 30, // 30 days
			...(options || {})
		});
	}
}

// Get the GitHub access token value
export function getGithubAccessToken(cookies: Cookies): string | undefined {
	return cookies.get(GITHUB_ACCESS_TOKEN_COOKIE);
}

// Get the GitHub refresh token value
export function getGithubRefreshToken(cookies: Cookies): string | undefined {
	return cookies.get(GITHUB_REFRESH_TOKEN_COOKIE);
}

// Delete the GitHub session cookies
export function deleteGithubTokens(cookies: Cookies) {
	cookies.delete(GITHUB_ACCESS_TOKEN_COOKIE, { path: '/' });
	cookies.delete(GITHUB_REFRESH_TOKEN_COOKIE, { path: '/' });
}
