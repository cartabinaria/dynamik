// SPDX-FileCopyrightText: 2024 Eyad Issa <eyadlorenzo@gmail.com>
//
// SPDX-License-Identifier: AGPL-3.0-or-later

import type { PageLoad } from './$types';
import { ASSET_URL } from '$lib/const';
import { redirect } from '@sveltejs/kit';

export const load: PageLoad = async ({ params }) => {
	const fileUrl = ASSET_URL(params.dir + '/' + params.file);

	// check if the user agent is iOS
	const isIOS = !import.meta.env.SSR && navigator.userAgent.match(/(iPad|iPhone|iPod)/g); // ! workaround
	if (isIOS) {
		// redirect to the original file
		redirect(302, fileUrl);
	}
	return {
		url: fileUrl
	};
};
