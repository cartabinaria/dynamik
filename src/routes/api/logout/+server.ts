import { redirect } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { deleteGithubTokens } from '$lib/server/sessionStore';

export const POST: RequestHandler = async ({ cookies, url }) => {
	// Remove the GitHub token cookies
	deleteGithubTokens(cookies);

	// Redirect to homepage
	throw redirect(302, url.origin + '/');
};