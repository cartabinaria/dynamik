import type { PageLoad } from './$types';
import { ASSET_URL } from '$lib/const';

export const load: PageLoad = async ({ fetch, params }) => {
	const res = await fetch(ASSET_URL(params.dir + '/' + params.file));
	const body = await res.text();

	const extension = params.file.split('.').pop() || '';

	return { body, extension };
};
