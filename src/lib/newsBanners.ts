// SPDX-FileCopyrightText: 2023 Xuanqiang Angelo Huang <huangelo02@gmail.com>
// SPDX-FileCopyrightText: 2024 Alice Benatti <alice17bee@gmail.com>
// SPDX-FileCopyrightText: 2026 Xtacy856X <Xtacy856X@users.noreply.github.com>
//
// SPDX-License-Identifier: AGPL-3.0-or-later

import { persisted } from 'svelte-local-storage-store';
import { derived, get, writable } from 'svelte/store';
import { browser } from '$app/environment';
import { GH_PAGES_BASE_URL } from '$lib/const';

export type NewsBanner = {
	/** Monotonically increasing version: bump it to re-show the banner. */
	version: number;
	title: string;
	body: string;
	/** Optional link shown after the body text. */
	href?: string | null;
};

const BANNER_KEY = 'newSettingsBannerVersion';

/**
 * Shown until the first successful load of the banner published on the
 * website, so that users still get informed when the fetch fails (issue #165).
 */
const FALLBACK_BANNER: NewsBanner = {
	version: 2,
	title: 'Nuova feature: ToDo List',
	body: 'All\'interno di tutte le pagine con file, cliccando sopra l\'icona potrai segnarlo e salvarlo come "fatto"!'
};

/** Weekly-updated banner content published by the website. */
export const BANNER_URL = `${GH_PAGES_BASE_URL}/news/banner.json`;

/** Returns the banner only when every required field is well-formed. */
export function validateBanner(data: unknown): NewsBanner | null {
	if (typeof data !== 'object' || data === null) return null;
	const { version, title, body, href } = data as Record<string, unknown>;
	if (typeof version !== 'number' || typeof title !== 'string' || typeof body !== 'string') {
		return null;
	}
	return { version, title, body, href: typeof href === 'string' ? href : null };
}

export const newsBanner = writable<NewsBanner>(FALLBACK_BANNER);

if (browser) {
	fetch(BANNER_URL)
		.then((res) => (res.ok ? res.json() : Promise.reject(new Error(String(res.status)))))
		.then((data) => {
			const banner = validateBanner(data);
			if (banner) {
				newsBanner.set(banner);
			}
		})
		.catch(() => {
			// The fallback banner stays in place when the site is unreachable
			// or serves malformed content.
		});
}

const dismissedLastVersion = persisted<number>(BANNER_KEY, 0);

export const setBannerClosed = () => {
	dismissedLastVersion.set(get(newsBanner).version);
};

export const shouldShowBanner = derived(
	[dismissedLastVersion, newsBanner],
	([dismissed, banner]) => dismissed < banner.version
);
