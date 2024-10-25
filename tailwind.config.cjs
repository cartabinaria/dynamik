const { addDynamicIconSelectors } = require('@iconify/tailwind');

/** @type {import('tailwindcss').Config} */
module.exports = {
	content: ['./src/**/*.{html,js,svelte,ts}'],
	theme: {
		extend: {
			gridTemplateColumns: {
				dir: 'min-content,auto,min-content',
				'dir-full': 'min-content,auto,min-content,max-content'
			}
		}
	},
	plugins: [require('@tailwindcss/typography'), require('daisyui'), addDynamicIconSelectors()],
	daisyui: {
		themes: [
			{
				cartabinaria_dark: {
					primary: '#EA8C55',
					secondary: '#971327',
					accent: '#4281A4',
					'base-100': '#02111B',
					content: '#F1FAEE',
					neutral: '#06253A',
					'base-200': '#0f1f2a' // versione chiara *commentabile*
				},
				cartabinaria_light: {
					secondary: '#971327',
					primary: '#EA8C55',
					accent: '#4281A4',
					content: '#02111B',
					'base-100': '#F1FAEE',
					neutral: '#DBE3D8'
				}
			},
			'halloween',
			'autumn',
			'dracula'
		]
	}
};
