// SPDX-FileCopyrightText: 2023 Eyad Issa <eyadlorenzo@gmail.com>
//
// SPDX-License-Identifier: AGPL-3.0-or-later

import dayjs from 'dayjs';
import localizedFormat from 'dayjs/plugin/localizedFormat';
import localeIt from 'dayjs/locale/it';

import type { Settings } from '$lib/settings';

dayjs.locale(localeIt);
dayjs.extend(localizedFormat);

export const formatDate = (settings: Settings, date: string) => {
	const dayjsDate = dayjs(date);
	if (settings.isoDates) {
		return dayjsDate.toISOString().substring(0, 19);
	} else {
		return dayjsDate.format('LLL');
	}
};
