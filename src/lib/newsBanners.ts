// SPDX-FileCopyrightText: 2023 Xuanqiang Angelo Huang <huangelo02@gmail.com>
// SPDX-FileCopyrightText: 2024 Alice Benatti <alice17bee@gmail.com>
//
// SPDX-License-Identifier: AGPL-3.0-or-later

import { persisted } from 'svelte-local-storage-store';
import { derived } from 'svelte/store';

const BANNER_KEY = 'newSettingsBannerVersion';
const ACTUAL_BANNER_VERSION = 2;

const dismissedLastVersion = persisted<number>(BANNER_KEY, 0);

export const setBannerClosed = () => {
	dismissedLastVersion.set(ACTUAL_BANNER_VERSION);
};

export const shouldShowBanner = derived(
	dismissedLastVersion,
	(store) => store < ACTUAL_BANNER_VERSION
);
