// SPDX-FileCopyrightText: 2023 - 2024 VaiTon <eyadlorenzo@gmail.com>
// SPDX-FileCopyrightText: 2023 Alice Benatti <74602443+ali-benny@users.noreply.github.com>
// SPDX-FileCopyrightText: 2023 Luca <luca.tagliavini5@studio.unibo.it>
//
// SPDX-License-Identifier: AGPL-3.0-or-later

import type { PageLoad } from './$types';
import { ASSET_URL } from '$lib/const';
import { redirect } from '@sveltejs/kit';

export const load: PageLoad = async ({ params }) => {
	const fileUrl = ASSET_URL(params.dir + '/' + params.zfile);

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
