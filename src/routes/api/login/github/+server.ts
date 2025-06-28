import { GITHUB_APP_ID } from '$env/static/private';
import { redirect } from '@sveltejs/kit';
import crypto from 'crypto';

const GITHUB_AUTHORIZE_URL = 'https://github.com/login/oauth/authorize';

export const POST = async ({ url, cookies, request }) => {
	// PKCE code verifier and challenge
	const code_verifier = crypto.randomBytes(32).toString('base64url');
	const code_challenge = code_verifier
		? crypto.createHash('sha256').update(code_verifier).digest('base64url')
		: '';

	// Store code_verifier in cookie (secure, httpOnly, short-lived)
	cookies.set('github_code_verifier', code_verifier, {
		path: '/',
		httpOnly: true,
		sameSite: 'lax',
		secure: true,
		maxAge: 300 // 5 minutes
	});

	// Get redirect param from form if present and store in cookie
	const formData = await request.formData();
	const redirectParam = formData.get('redirect');
	if (redirectParam) {
		cookies.set('github_post_login_redirect', redirectParam.toString(), {
			path: '/',
			httpOnly: true,
			sameSite: 'lax',
			secure: true,
			maxAge: 300 // 5 minutes
		});
	}

	const params = new URLSearchParams({
		client_id: GITHUB_APP_ID,
		redirect_uri: `${url.origin}/api/login/github/callback`,
		scope: 'read:user user:email',
		response_type: 'code',
		code_challenge,
		code_challenge_method: 'S256'
	});

	throw redirect(302, `${GITHUB_AUTHORIZE_URL}?${params.toString()}`);
};