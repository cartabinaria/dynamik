// SPDX-FileCopyrightText: 2024 Alice Benatti <alice17bee@gmail.com>
//
// SPDX-License-Identifier: AGPL-3.0-or-later

import { persisted } from 'svelte-local-storage-store';
import { derived } from 'svelte/store';

export const doneFiles = persisted<Record<string, boolean>>('doneFiles', {});

export const getDoneStatus = (fileUrl: string) => {
	const store = derived(doneFiles, ($doneFiles) => $doneFiles[fileUrl] ?? false);
	return {
		...store,

		set: (value: boolean) => {
			doneFiles.update((doneFiles) => ({ ...doneFiles, [fileUrl]: value }));
		},

		toggle: () => {
			doneFiles.update((doneFiles) => ({ ...doneFiles, [fileUrl]: !doneFiles[fileUrl] }));
		}
	};
};

export const anyFileDone = (fileUrls: string[]) =>
	derived(doneFiles, ($doneFiles) => {
		if (fileUrls.length === 0) return false;
		return fileUrls.some((fileUrl) => $doneFiles[fileUrl] ?? false);
	});
