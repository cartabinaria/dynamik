// SPDX-FileCopyrightText: 2026 Xtacy856X <Xtacy856X@users.noreply.github.com>
//
// SPDX-License-Identifier: AGPL-3.0-or-later

import type { StatikEntry } from '$lib/api';

export type FileGroup = {
	/** The file rendered as the main entry of the row (the PDF when available). */
	primary: StatikEntry;
	/** Same-basename files shown on the same line (e.g. the markdown next to the PDF). */
	variants: StatikEntry[];
};

/**
 * Extensions that refer to the same content and should share one row.
 * Each entry of such a group is an alternative rendering of the same resource.
 */
const variantExtensions = new Set(['pdf', 'md']);

function splitExtension(name: string): { base: string; ext: string | null } {
	const dot = name.lastIndexOf('.');
	if (dot <= 0) return { base: name, ext: null };
	return { base: name.slice(0, dot), ext: name.slice(dot + 1).toLowerCase() };
}

/**
 * Groups files that share the same basename and are alternative formats of the
 * same content (e.g. `appunti.pdf` and `appunti.md`) so that they can be
 * rendered on a single line, as requested in issue #289.
 *
 * Only pairs of formats listed in `variantExtensions` are grouped, and only
 * when the set of their extensions is not a single format, so that files that
 * merely share a prefix are left untouched. The input is expected to be
 * already sorted (as done by the caller), which keeps groups contiguous.
 */
export function groupFileVariants(files: StatikEntry[]): (StatikEntry | FileGroup)[] {
	const result: (StatikEntry | FileGroup)[] = [];

	for (const file of files) {
		const { base, ext } = splitExtension(file.name);
		const previous = result.length > 0 ? result[result.length - 1] : undefined;

		if (
			ext != null &&
			variantExtensions.has(ext) &&
			previous != null &&
			!('primary' in previous) &&
			splitExtension(previous.name).base === base
		) {
			const previousExt = splitExtension(previous.name).ext;
			if (previousExt == null || !variantExtensions.has(previousExt)) {
				result.push(file);
				continue;
			}
			const primary = ext === 'pdf' ? file : previous;
			const variants = ext === 'pdf' ? [previous] : [file];
			result[result.length - 1] = { primary, variants };
			continue;
		}

		if (
			ext != null &&
			variantExtensions.has(ext) &&
			previous != null &&
			'primary' in previous &&
			splitExtension(previous.primary.name).base === base
		) {
			previous.variants.push(file);
			continue;
		}

		result.push(file);
	}

	return result;
}
