import type { LayoutLoad } from './$types';
import { browser } from '$app/environment';
import { goto } from '$app/navigation';

export const load: LayoutLoad = async ({ url }) => {
	// Auto-redirect based on browser language (only on client-side)
	if (browser) {
		const acceptLanguage = navigator.language || navigator.languages?.[0] || 'en';
		const isItalian = acceptLanguage.toLowerCase().startsWith('it');
		
		// Se l'utente ha preferenza italiana e sta accedendo a route inglesi
		// e non ha mai fatto una scelta esplicita, suggerisci il redirect
		if (isItalian && url.pathname.startsWith('/en/')) {
			const hasLanguagePreference = localStorage.getItem('dynamik-language-preference');
			
			if (!hasLanguagePreference) {
				// Mostra un toast o banner per suggerire la versione italiana
				// Ma non fare auto-redirect aggressivo per non confondere
				console.log('Italian language detected, but user is on English page');
			}
		}
	}

	return {};
};
