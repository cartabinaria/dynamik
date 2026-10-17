// SPDX-FileCopyrightText: 2023 Alice Benatti <alice17bee@gmail.com>
// SPDX-FileCopyrightText: 2023 Eyad Issa <eyadlorenzo@gmail.com>
//
// SPDX-License-Identifier: AGPL-3.0-or-later

import { sveltekit } from '@sveltejs/kit/vite';
import { SvelteKitPWA } from '@vite-pwa/sveltekit';
import { defineConfig } from 'vite';
import tailwindcss from '@tailwindcss/vite';
import vercelAdapter from '@sveltejs/adapter-vercel';
import nodeAdapter from '@sveltejs/adapter-node';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';

const BASE_PATH = process.env.BASE_PATH || '';
const CARTABINARIA_DEPLOY = process.env.CARTABINARIA_DEPLOY === 'true';

function chooseAdapter() {
	return CARTABINARIA_DEPLOY ? nodeAdapter() : vercelAdapter();
}

export default defineConfig({
	plugins: [
		tailwindcss(),
		sveltekit({
			adapter: chooseAdapter(),
			preprocess: vitePreprocess(),
			paths: {
				base: BASE_PATH == '' ? '' : `/${BASE_PATH}`
			}
		}),
		SvelteKitPWA({/* other pwa options */})
	],
	optimizeDeps: {}
});
