// SPDX-FileCopyrightText: 2023 - 2024 Alice Benatti <74602443+ali-benny@users.noreply.github.com>
// SPDX-FileCopyrightText: 2023 - 2025 VaiTon <eyadlorenzo@gmail.com>
// SPDX-FileCopyrightText: 2023 Angelo Huang <63465494+Flecart@users.noreply.github.com>
// SPDX-FileCopyrightText: 2023 Luca <luca.tagliavini5@studio.unibo.it>
//
// SPDX-License-Identifier: AGPL-3.0-or-later

import { persisted } from 'svelte-local-storage-store';

export const themes = ['halloween', 'autumn', 'dracula', 'light', 'dark'] as const;

type Theme = (typeof themes)[number];

export const DEFAULT_COURSE_KEY = 'default';

export interface Settings {
	theme: Theme;
	newTab: boolean;
	isoDates: boolean;
	defaultCourse: string;
}

const settings = persisted<Settings>('settings', {
	theme: 'dark',
	newTab: false,
	defaultCourse: DEFAULT_COURSE_KEY,
	isoDates: false
});

export default settings;
