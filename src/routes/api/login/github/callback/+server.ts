import { GITHUB_APP_SECRET, GITHUB_APP_ID } from '$env/static/private';
import { redirect } from '@sveltejs/kit';
import { setGithubTokens } from '$lib/server/sessionStore';

/**
 * Exchanges the authorization code for an access token using PKCE.
 */
import { exchangeCodeForToken } from '$lib/server/github/githubApi';

export const GET = async ({ url, cookies, fetch }) => {
	const code = url.searchParams.get('code');
	if (!code) {
		throw new Error('Missing required "code" parameter in URL');
	}

	const stored_verifier = cookies.get('github_code_verifier');

	if (!code || !stored_verifier) {
		return new Response('Missing code or PKCE verifier', { status: 400 });
	}

	// Try to get redirect param from cookie or URL, and filter to prevent open redirect
	let redirectTo = cookies.get('github_post_login_redirect') || url.searchParams.get('redirect') || '/';
	if (redirectTo && !redirectTo.startsWith('/')) {
		redirectTo = '/';
	}

	let tokenData;
	try {
		tokenData = await exchangeCodeForToken({
			code,
			code_verifier: stored_verifier,
			client_id: GITHUB_APP_ID,
			client_secret: GITHUB_APP_SECRET,
			redirect_uri: `${url.origin}/api/login/github/callback`,
			fetch
		});
	} catch {
		return new Response('Failed to obtain access token', { status: 400 });
	}

	if (!tokenData.access_token) {
		return new Response('Failed to obtain access token', { status: 400 });
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
