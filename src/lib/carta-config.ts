import { Carta } from 'carta-md';
import { emoji } from '@cartamd/plugin-emoji';
import { code } from '@cartamd/plugin-code';
import { math } from '@cartamd/plugin-math';
import DOMPurify from 'isomorphic-dompurify';
import { attachment } from '@cartamd/plugin-attachment';
import settings from '$lib/settings';
import { get } from 'svelte/store';

function getTheme() {
	const theme = get(settings).theme;
	if (theme == 'dark') return 'github-dark';
	else if (theme == 'light' || theme == 'autumn') return 'github-light';
	return theme;
}

// Shared Carta configuration for markdown rendering
export function getCartaConfig() {
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
						const response = await fetch('/omar/upload', {
							method: 'POST',
							// Don't set Content-Type header - the browser will set it automatically
							// with the correct boundary parameter for multipart/form-data
							body: formData
						});

						if (!response.ok) {
							throw new Error(`HTTP error! status: ${response.status}`);
						}
						// const data = await response.json();
						// console.log("File uploaded successfully:", {
						//   fileName: file.name,
						//   fileSize: file.size,
						//   fileType: file.type,
						//   response: data
						// });

						//return "https://avatars.githubusercontent.com/u/115153426?v=4" const url = URL.createObjectURL(file);
						// console.log(url);
						// return url;
						return `/omar/image`;
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
