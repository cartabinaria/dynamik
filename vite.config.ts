// SPDX-FileCopyrightText: 2023 Alice Benatti <alice17bee@gmail.com>
// SPDX-FileCopyrightText: 2023 Eyad Issa <eyadlorenzo@gmail.com>
//
// SPDX-License-Identifier: AGPL-3.0-or-later

import { sveltekit } from '@sveltejs/kit/vite';
import { SvelteKitPWA } from '@vite-pwa/sveltekit';
import { defineConfig } from 'vite';

export default defineConfig({
  plugins: [
    sveltekit(),
    SvelteKitPWA({
      /* other pwa options */
    })
  ],
  build: {
    sourcemap: true
  },
  optimizeDeps: {}
});
