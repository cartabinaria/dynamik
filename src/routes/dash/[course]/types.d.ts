import type { Teaching } from '$lib/teachings';

export type TeachingsBatch = {
	year: number;
	teachings: Teaching[];
};
