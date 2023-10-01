const UPDL_URL = import.meta.env.VITE_UPLD_URL;

if (UPDL_URL == null) {
	throw new Error('Missing VITE_UPLD_URL');
}

export function getLoginUrl(redirectUrl: string | URL): string {
	return `${UPDL_URL}/login?redirect_uri=${redirectUrl}`;
}

export async function getWhoAmI(fetch: typeof window.fetch) {
	const res = await fetch(`${UPDL_URL}/whoami`, { credentials: 'include' });

	return res.json();
}
