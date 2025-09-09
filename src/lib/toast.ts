/*
SPDX-FileCopyrightText: 2025 Alice Benatti <alice17bee@gmail.com>

SPDX-License-Identifier: AGPL-3.0-or-later
*/

import { toast as svelteToast } from '@zerodevx/svelte-toast';

// cache color theme
let cachedColors: Record<string, string> | null = null;
let themeObserver: MutationObserver | null = null;

// get daisyui colors
function getThemeColors(): Record<string, string> {
	if (cachedColors) return cachedColors;

	const root = document.documentElement;
	const computedStyle = getComputedStyle(root);

	cachedColors = {
		'--success-bg': computedStyle.getPropertyValue('--su') || 'hsl(158 64% 52%)',
		'--success-text': computedStyle.getPropertyValue('--suc') || 'hsl(158 100% 10%)',
		'--error-bg': computedStyle.getPropertyValue('--er') || 'hsl(0 91% 71%)',
		'--error-text': computedStyle.getPropertyValue('--erc') || 'hsl(0 100% 14%)',
		'--warning-bg': computedStyle.getPropertyValue('--wa') || 'hsl(43 96% 56%)',
		'--warning-text': computedStyle.getPropertyValue('--wac') || 'hsl(43 100% 11%)',
		'--info-bg': computedStyle.getPropertyValue('--in') || 'hsl(198 93% 60%)',
		'--info-text': computedStyle.getPropertyValue('--inc') || 'hsl(198 100% 12%)'
	};

	// Setup observer per invalidare cache quando cambia tema
	if (!themeObserver) {
		themeObserver = new MutationObserver(() => {
			cachedColors = null; // Invalida cache
		});
		themeObserver.observe(document.documentElement, {
			attributes: true,
			attributeFilter: ['data-theme', 'class']
		});
	}

	return cachedColors;
}

// wrapper per toast con colori DaisyUI
export const toast = {
	success: (message: string) => {
		const colors = getThemeColors();
		svelteToast.push(message, {
			theme: {
				'--toastColor': colors['--success-text'],
				'--toastBackground': colors['--success-bg'],
				'--toastBarBackground': colors['--success-text']
			}
		});
	},

	error: (message: string) => {
		const colors = getThemeColors();
		svelteToast.push(message, {
			theme: {
				'--toastColor': colors['--error-text'],
				'--toastBackground': colors['--error-bg'],
				'--toastBarBackground': colors['--error-text']
			}
		});
	},

	warning: (message: string) => {
		const colors = getThemeColors();
		svelteToast.push(message, {
			theme: {
				'--toastColor': colors['--warning-text'],
				'--toastBackground': colors['--warning-bg'],
				'--toastBarBackground': colors['--warning-text']
			}
		});
	},

	info: (message: string) => {
		const colors = getThemeColors();
		svelteToast.push(message, {
			theme: {
				'--toastColor': colors['--info-text'],
				'--toastBackground': colors['--info-bg'],
				'--toastBarBackground': colors['--info-text']
			}
		});
	}
};
