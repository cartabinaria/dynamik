// SPDX-FileCopyrightText: 2023 - 2025 Eyad Issa <eyadlorenzo@gmail.com>
// SPDX-FileCopyrightText: 2023 Stefano Volpe <stefano.volpe@student.uva.nl>
// SPDX-FileCopyrightText: 2023 kocierik <kocierik@gmail.com>
//
// SPDX-License-Identifier: AGPL-3.0-or-later

import type { PageLoad } from './$types';

import { DEGREES } from '$lib/teachings';

export const load: PageLoad = async () => {
	return { degrees: DEGREES };
};
