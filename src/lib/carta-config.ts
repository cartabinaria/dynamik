import { Carta } from 'carta-md';
import { emoji } from '@cartamd/plugin-emoji';
import { code } from '@cartamd/plugin-code';
import { math } from '@cartamd/plugin-math';
import DOMPurify from 'isomorphic-dompurify';
import { attachment } from '@cartamd/plugin-attachment';

// Shared Carta configuration for markdown rendering
export const carta = new Carta({
	extensions: [
		emoji(),
		code(),
		math(),
		attachment({
			upload: async (file) => {
				/* TODO: Implement file upload logic */
				return null;
			}
		})
	],
	sanitizer: DOMPurify.sanitize
});
