// SPDX-FileCopyrightText: 2023 - 2024 Eyad Issa <eyadlorenzo@gmail.com>
// SPDX-FileCopyrightText: 2023 Stefano Volpe <stefano.volpe@student.uva.nl>
//
// SPDX-License-Identifier: AGPL-3.0-or-later

import { getActiveTeachings } from '$lib/teachings';
import { DEGREES, TEACHINGS } from '$lib/teachings';
import type { PageLoad } from './$types';

export const load: PageLoad = async ({ fetch }) => {
	const activeTeachings = DEGREES.map((c) => getActiveTeachings(fetch, c));

	return {
		activeTeachings: await Promise.all(activeTeachings),
		degrees: DEGREES,
		teachings: TEACHINGS
	};
};
