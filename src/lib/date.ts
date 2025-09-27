/*
SPDX-FileCopyrightText: 2025 Alice Benatti <alice17bee@gmail.com>
SPDX-FileCopyrightText: 2023 - 2025 VaiTon <eyadlorenzo@gmail.com>
SPDX-FileCopyrightText: 2023 Eyad Issa <eyadlorenzo@gmail.com>

SPDX-License-Identifier: AGPL-3.0-or-later
*/

import dayjs from 'dayjs';
import localizedFormat from 'dayjs/plugin/localizedFormat';
import relativeTime from 'dayjs/plugin/relativeTime';
import localeIt from 'dayjs/locale/it';

import type { Settings } from '$lib/settings';

dayjs.locale(localeIt);
dayjs.extend(localizedFormat);
dayjs.extend(relativeTime);

export const formatDate = (date: string, settings?: Settings) => {
	const dayjsDate = dayjs(date);
	if (settings?.isoDates) {
		return dayjsDate.toISOString().substring(0, 19);
	} else {
		return dayjsDate.format('LLL');
	}
};

/**
 * Formats timestamp in hybrid format: "Oggi 14:30", "Ieri 09:15", "29 Aug 2025, 16:22"
 */
export const formatRelativeTime = (timestamp: string) => {
	const date = dayjs(timestamp);
	const now = dayjs();
	const diffHours = now.diff(date, 'hour');

	if (diffHours < 24) {
		return `Oggi ${date.format('HH:mm')}`;
	} else if (diffHours < 48) {
		return `Ieri ${date.format('HH:mm')}`;
	} else {
		return `${date.format('DD MMM YYYY')}, ${date.format('HH:mm')}`;
	}
};
