import type { PageLoad } from './$types';
import { ASSET_URL } from '$lib/const';
import { redirect } from '@sveltejs/kit';

export const load: PageLoad = async ({ params }) => {
	const fileUrl = ASSET_URL(params.dir + '/' + params.zfile);
	
	// check if the user agent is iOS
	const isIOS = !import.meta.env.SSR && navigator.userAgent.match(/(iPad|iPhone|iPod)/g);		// ! workaround
	if (isIOS) {
		// redirect to the original file
		throw redirect(302, fileUrl);
	}
	return {
		url: fileUrl
	};
};
