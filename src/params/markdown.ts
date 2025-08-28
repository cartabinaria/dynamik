// SPDX-FileCopyrightText: 2023 - 2024 Eyad Issa <eyadlorenzo@gmail.com>
// SPDX-FileCopyrightText: 2023 Luca Tagliavini <luca@teapot.ovh>
//
// SPDX-License-Identifier: AGPL-3.0-or-later

import type { ParamMatcher } from '@sveltejs/kit';

export const match: ParamMatcher = (param) => /^.+\.md$/.test(param);
