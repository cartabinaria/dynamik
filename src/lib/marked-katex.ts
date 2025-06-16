// SPDX-FileCopyrightText: 2023 Luca Tagliavini <luca@teapot.ovh>
// SPDX-FileCopyrightText: 2023 Eyad Issa <eyadlorenzo@gmail.com>
//
// SPDX-License-Identifier: AGPL-3.0-or-later

// taken from: https://github.com/UziTech/marked-katex-extension/issues/42#issuecomment-1445240740
import katex, { type KatexOptions } from 'katex';
import type { TokenizerAndRendererExtension, Tokens } from 'marked';

export default function markedKatex(options = {}): {
	extensions: TokenizerAndRendererExtension[];
} {
	return {
		extensions: [inlineKatex(options), blockKatex(options)]
	};
}

function inlineKatex(options: KatexOptions | undefined) {
	return {
		name: 'inlineKatex',
		level: 'inline',
		start(src: string) {
			return src.indexOf('$');
		},
		tokenizer(src: string): Tokens.Generic | void {
			const match = src.match(/^\$+([^$\n]+?)\$+/);
			if (match) {
				return {
					type: 'inlineKatex',
					raw: match[0],
					text: match[1].trim()
				};
			}
		},
		// warning: generic loses typescript checking below
		renderer(token: Tokens.Generic) {
			return katex.renderToString(token.text, options);
		}
	};
}

function blockKatex(options: KatexOptions | undefined) {
	return {
		name: 'blockKatex',
		level: 'block',
		start(src: string) {
			return src.indexOf('\n$$');
		},
		tokenizer(src: string): Tokens.Generic | void {
			const match = src.match(/^\$\$+\n([^$]+?)\n\$\$+\n/);
			if (match) {
				return {
					type: 'blockKatex',
					raw: match[0],
					text: match[1].trim()
				};
			}
		},
		// warning: generic loses typescript checking below
		renderer(token: Tokens.Generic) {
			return `<p>${katex.renderToString(token.text, options)}</p>`;
		}
	};
}
