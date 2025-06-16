// SPDX-FileCopyrightText: 2023 - 2024 VaiTon <eyadlorenzo@gmail.com>
// SPDX-FileCopyrightText: 2023 Luca <luca.tagliavini5@studio.unibo.it>
//
// SPDX-License-Identifier: AGPL-3.0-or-later

import type { ParamMatcher } from '@sveltejs/kit';

export const match: ParamMatcher = (param) => /^.+\.md$/.test(param);
