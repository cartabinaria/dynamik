import type { LayoutServerLoad } from './$types';
import { getUserInfo } from '$lib/server/github/githubApi';

export const load: LayoutServerLoad = async ({ locals, fetch }) => {
	let user = null;

	if (locals.github_access_token) {
		try {
			user = await getUserInfo({
				access_token: locals.github_access_token,
				fetch
			});
		} catch {
			user = null;
		}
	}

	return { user };
};
