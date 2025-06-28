import { env } from '$env/dynamic/private';
import { error, redirect } from '@sveltejs/kit';
import { setGithubTokens } from '$lib/server/sessionStore';

/**
 * Exchanges the authorization code for an access token using PKCE.
 */
import { exchangeCodeForToken } from '$lib/server/github/githubApi';

export const GET = async ({ url, cookies, fetch }) => {
	if (!env.GITHUB_APP_ID || !env.GITHUB_APP_SECRET) {
		error(500, 'GitHub app credentials are not configured');
	}

	const code = url.searchParams.get('code');
	if (!code) {
		error(400, 'Missing authorization code');
	}

	const stored_verifier = cookies.get('github_code_verifier');

	if (!code || !stored_verifier) {
		error(400, 'Missing authorization code or PKCE verifier');
	}

	// Try to get redirect param from cookie or URL, and filter to prevent open redirect
	let redirectTo =
		cookies.get('github_post_login_redirect') || url.searchParams.get('redirect') || '/';
	if (redirectTo && !redirectTo.startsWith('/')) {
		redirectTo = '/';
	}

	let tokenData;
	try {
		tokenData = await exchangeCodeForToken({
			code,
			code_verifier: stored_verifier,
			client_id: env.GITHUB_APP_ID,
			client_secret: env.GITHUB_APP_SECRET,
			redirect_uri: `${url.origin}/api/login/github/callback`,
			fetch
		});
	} catch {
		error(500, 'Failed to exchange code for access token');
	}

	if (!tokenData.access_token) {
		error(500, 'No access token received from GitHub');
	}

	// Clean up the PKCE verifier cookie
	cookies.delete('github_code_verifier', { path: '/' });
	// Clean up the redirect cookie if present
	cookies.delete('github_post_login_redirect', { path: '/' });

	// Store the GitHub access and refresh tokens as secure, HTTP-only cookies
	setGithubTokens(cookies, tokenData.access_token, tokenData.refresh_token);

	// Redirect to the intended page
	throw redirect(302, redirectTo);
};
