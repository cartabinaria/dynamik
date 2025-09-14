/*
SPDX-FileCopyrightText: 2025 Alice Benatti <alice17bee@gmail.com>
SPDX-FileCopyrightText: 2025 Samuele Musiani <samu@teapot.ovh>

SPDX-License-Identifier: AGPL-3.0-or-later
*/

import { emoji } from '@cartamd/plugin-emoji';
import { code } from '@cartamd/plugin-code';
import { math } from '@cartamd/plugin-math';
import DOMPurify from 'isomorphic-dompurify';
import { attachment } from '@cartamd/plugin-attachment';
import settings from '$lib/settings';
import { get } from 'svelte/store';
import { IMAGES_URL, POLLEG_BASE_URL } from './const';
import { Carta } from 'carta-md';

function getTheme() {
	const theme = get(settings).theme;
	if (theme == 'dark') return 'github-dark';
	else if (theme == 'light' || theme == 'autumn') return 'github-light';
	return theme;
}
export const carta = new Carta(getCartaConfig());
// Shared Carta configuration for markdown rendering
function getCartaConfig() {
	return {
		extensions: [
			emoji(),
			code({
				theme: getTheme()
			}),
			math(),
			attachment({
				async upload(file) {
					const formData = new FormData();

					// Add the file - the browser will automatically handle the proper
					// multipart/form-data encoding and content-type
					formData.append('file', file);

					// You can also add any additional metadata
					formData.append('uploadTime', new Date().toISOString());
					formData.append('fileName', file.name);
					formData.append('fileSize', file.size.toString());
					formData.append('fileType', file.type);

					try {
						const response = await fetch(IMAGES_URL, {
							method: 'POST',
							// Don't set Content-Type header - the browser will set it automatically
							// with the correct boundary parameter for multipart/form-data
							body: formData,
							credentials: 'include'
						});

						if (!response.ok) {
							throw new Error(`HTTP error! status: ${response.status}`);
						}
						const data = await response.json();

						return POLLEG_BASE_URL + '/' + data.url;
					} catch (error) {
						console.error('Error uploading file:', error);
						return null;
					}
				}
			})
		],
		shikiOptions: {
			themes: ['github-dark', 'github-light', 'dracula']
		},
		sanitizer: DOMPurify.sanitize
	};
}
