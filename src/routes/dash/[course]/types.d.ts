// SPDX-FileCopyrightText: 2024 Eyad Issa <eyadlorenzo@gmail.com>
//
// SPDX-License-Identifier: AGPL-3.0-or-later

import type { Teaching } from '$lib/teachings';

export type TeachingsBatch = {
	year: number;
	teachings: Teaching[];
};
