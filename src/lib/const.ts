const ORG = 'cartabinaria';
export const RISORSE_BASE_URL = process.env.VITE_RISORSE_BASE_URL || 'https://dynamik.vercel.app/';
export const GH_PAGES_BASE_URL = `https://${ORG}.github.io`;
const GH_BASE_URL = `https://github.com/${ORG}`;
const GH_DEV_BASE_URL = `https://github.dev/${ORG}`;
export const STATIK_URL = (path: string) => `${GH_PAGES_BASE_URL}/${path}/statik.json`;
export const ASSET_URL = (path: string) => `${GH_PAGES_BASE_URL}/${path}`;
export const FUZZY_URL = (path: string) => `${GH_PAGES_BASE_URL}/${path}/fuzzy.json`;
export const EDIT_URLS = (path: string) => {
	const [, repo, ...rest] = path.split('/');
	const filePath = rest.join('/');
	return {
		github: `${GH_BASE_URL}/${repo}/blob/main/${filePath}`,
		github_repo: `${GH_BASE_URL}/${repo}`,
		github_edit: `${GH_BASE_URL}/${repo}/edit/main/${filePath}`,
		github_dev: `${GH_DEV_BASE_URL}/${repo}/blob/main/${filePath}`
	};
};
export const MAX_YEARS_FOR_DEGREE = 3;
