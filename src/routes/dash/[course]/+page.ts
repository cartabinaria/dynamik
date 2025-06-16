// SPDX-FileCopyrightText: 2023 - 2024 Eyad Issa <eyadlorenzo@gmail.com>
// SPDX-FileCopyrightText: 2023 Stefano Volpe <stefano.volpe@student.uva.nl>
// SPDX-FileCopyrightText: 2023 kocierik <kocierik@gmail.com>
//
// SPDX-License-Identifier: AGPL-3.0-or-later

import { getActiveTeachings } from '$lib/teachings';
import { DEGREES, TEACHINGS } from '$lib/teachings';
import { error } from '@sveltejs/kit';
import type { PageLoad } from './$types';

export const load = (async ({ fetch, params }) => {
	const degreeParam = params.course,
		degree = DEGREES.find((c) => c.id === degreeParam);

	if (degree == null) {
		error(404, `Degree '${degreeParam}' not found`);
	}

	return {
		degree,
		teachings: TEACHINGS,
		streaming: {
			activeTeachings: getActiveTeachings(fetch, degree)
		}
	};
}) satisfies PageLoad;
