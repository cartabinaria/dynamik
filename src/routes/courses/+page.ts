// SPDX-FileCopyrightText: 2026 Eyad Issa <eyadlorenzo@gmail.com>
//
// SPDX-License-Identifier: AGPL-3.0-or-later

import { TEACHINGS } from '$lib/teachings';
import type { PageLoad } from './$types';

export const load: PageLoad = () => {
	return {
		teachings: Array.from(TEACHINGS.values())
	};
};
