// SPDX-FileCopyrightText: 2023 - 2024 Eyad Issa <eyadlorenzo@gmail.com>
// SPDX-FileCopyrightText: 2023 Luca Tagliavini <luca@teapot.ovh>
// SPDX-FileCopyrightText: 2024 Samuele Musiani <samu@teapot.ovh>
// SPDX-FileCopyrightText: 2024 Stefano Volpe <stefano.volpe@student.uva.nl>
//
// SPDX-License-Identifier: AGPL-3.0-or-later

import vercelAdapter from '@sveltejs/adapter-vercel';
import nodeAdapter from '@sveltejs/adapter-node';

import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';

const BASE_PATH = process.env.BASE_PATH || '';
const CARTABINARIA_DEPLOY = process.env.CARTABINARIA_DEPLOY === 'true';

/**
 *
 * @returns {import('@sveltejs/kit').Adapter}
 */
function chooseAdapter() {
	if (CARTABINARIA_DEPLOY) {
		return nodeAdapter();
	} else {
		return vercelAdapter();
	}
}

/** @type {import('@sveltejs/kit').Config} */
const config = {
	// Consult https://kit.svelte.dev/docs/integrations#preprocessors
	// for more information about preprocessors
	preprocess: vitePreprocess(),

	kit: {
		// adapter-auto only supports some environments, see https://kit.svelte.dev/docs/adapter-auto for a list.
		// If your environment is not supported or you settled on a specific environment, switch out the adapter.
		// See https://kit.svelte.dev/docs/adapters for more information about adapters.
		adapter: chooseAdapter(),
		paths: {
			base: BASE_PATH == '' ? '' : `/${BASE_PATH}`
		}
	}
};

export default config;
