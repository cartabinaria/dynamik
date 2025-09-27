<!--
SPDX-FileCopyrightText: 2023 - 2025 Alice Benatti <alice17bee@gmail.com>
SPDX-FileCopyrightText: 2023 - 2024 Samuele Musiani <samu@teapot.ovh>
SPDX-FileCopyrightText: 2023 - 2025 Eyad Issa <eyadlorenzo@gmail.com>
SPDX-FileCopyrightText: 2023 Erik <kocierik@gmail.com>
SPDX-FileCopyrightText: 2023 Luca Tagliavini <luca@teapot.ovh>
SPDX-FileCopyrightText: 2023 Stefano Volpe <stefano.volpe@student.uva.nl>
SPDX-FileCopyrightText: 2023 kocierik <kocierik@gmail.com>

SPDX-License-Identifier: AGPL-3.0-or-later
-->

<script lang="ts">
	import { page } from '$app/state';

	import { teachingsFilter, type Degree } from '$lib/teachings';
	import { doneFiles, anyFileDone } from '$lib/todo-file';

	import Line from '$lib/components/Line.svelte';
	import Breadcrumbs from '$lib/components/Breadcrumbs.svelte';
	import FuzzySearch from '$lib/components/FuzzySearch.svelte';

	import type { PageData } from './$types';
	import type { StatikEntry } from '$lib/api';
	import { refreshAuth } from '$lib/polleg.svelte';
	import { onMount } from 'svelte';

	let { data }: { data: PageData } = $props();
	let { manifest } = $derived(data);

	onMount(async () => {
		await refreshAuth(fetch);
	});

	function kebabToTitle(str: string) {
		return str
			.split('-')
			.map((s) => s[0].toUpperCase() + s.slice(1))
			.join(' ');
	}

	function titleToAcronym(str: string) {
		return str
			.split(' ')
			.map((s) => s[0].toUpperCase())
			.join('');
	}

	function genTitle(parts: string[]) {
		if (parts.length === 0) return 'Risorse';
		const title = kebabToTitle(parts[0]);

		if (parts.length === 1) {
			return title;
		} else if (parts.length === 2) {
			return titleToAcronym(title) + ' > ' + kebabToTitle(parts[1]);
		} else {
			return titleToAcronym(title) + ' >...> ' + kebabToTitle(parts[parts.length - 1]);
		}
	}

	let fuzzy: FuzzySearch;

	let urlParts = $derived(
		page.url.pathname
			.split('/')
			.slice(1)
			.filter((p) => p !== '') // otherwise we get an empty string at the end
	);

	let title = $derived(genTitle(urlParts));

	// Checks if a teaching is part of a certain degree
	function isInDegree(teachingName: string, degree: Degree, elective: boolean): boolean {
		if (degree.teachings != null) return false;
		return teachingsFilter(degree, undefined, !elective).includes(teachingName);
	}

	// Skims through degrees looking for a given teaching
	function skimDegrees(teachingName: string, electives: boolean): string | undefined {
		const degree = data.degrees.find((d) => isInDegree(teachingName, d, electives));
		return degree != null ? degree.id : undefined;
	}

	// Picks a containing degree for this teaching
	function guessDegree(teachingName: string): string | null {
		// Plan A: "from" url parameter
		if (data.from) return data.from;
		// Plan B: "degree" field in Teachings
		const teaching = data.teachings.get(teachingName);
		if (teaching?.degree) return teaching.degree;
		// Plan C: any degree featuring this teaching as mandatory
		const mandatoryDegree = skimDegrees(teachingName, false);
		if (mandatoryDegree != null) return mandatoryDegree;
		// Plan D: any degree featuring this teaching as an elective
		const electiveDegree = skimDegrees(teachingName, true);
		if (electiveDegree != null) return electiveDegree;
		// Plan E: give up
		return null;
	}

	let degree = $derived(guessDegree(urlParts[0]));

	// Done file status
	let isDone = $derived(anyFileDone(manifest.files?.map((f) => f.url) ?? []));

	function cleanDone() {
		doneFiles.update((old) => {
			manifest.files?.forEach((f) => {
				old[f.url] = false;
			});
			return old;
		});
		return true;
	}

	// --- Sorting ---
	let reverseMode = $state(false); // partiamo in ordine A-Z

	const prepareForDisplay = (statikEntries: StatikEntry[]) => {
		if (!statikEntries) return [];
		const sortedEntries = [...statikEntries].sort((a, b) => a.name.localeCompare(b.name));
		return reverseMode ? sortedEntries.reverse() : sortedEntries;
	};

	let directories = $derived(prepareForDisplay(data.manifest.directories ?? []));
	let files = $derived(prepareForDisplay(data.manifest.files ?? []));
</script>

<svelte:head>
	<title>{title}</title>
	<meta property="og:title" content={title} />
</svelte:head>

<main class="max-w-6xl min-w-fit p-1 md:p-4 mx-auto">
	<Breadcrumbs {degree} url={page.url} onfuzzy={() => fuzzy.show()} />

	<div class="flex flex-1 justify-start mr-4 mb-3 mt-4">
		{#if $isDone}
			<button
				class="lg:ml-2 p-1 flex ml-3 items-center"
				onclick={cleanDone}
				title="Clean all done files in this page"
				aria-label="Clean all done files in this page"
			>
				<input
					type="checkbox"
					class="checkbox checkbox-sm"
					id="my-checkbox"
					bind:checked={$isDone}
				/>
			</button>
		{/if}
		<!-- Reverse Mode -->
		<button
			class="btn btn-ghost lg:ml-2 px-3 py-2 flex items-center gap-2 rounded-xl hover:bg-base-200 transition"
			onclick={() => (reverseMode = !reverseMode)}
			title={reverseMode ? 'Ordina A → Z' : 'Ordina Z → A'}
			aria-label={reverseMode ? 'Ordina A → Z' : 'Ordina Z → A'}
		>
			{reverseMode ? 'Nome (Z → A)' : 'Nome (A → Z)'}
			<span
				class="text-xl icon-[solar--sort-vertical-bold-duotone] transition-transform duration-300"
				class:rotate-180={reverseMode}
			></span>
		</button>
	</div>

	<div
		class="grid gap-5 md:grid-cols-[min-content_auto_min-content_max-content] grid-cols-[1fr_auto_min-content] mx-4 text-lg"
	>
		{#if directories != null}
			{#each directories as dir (dir.url)}
				<Line data={dir} isPolleg={data.isPolleg.includes(dir.name)} />
			{/each}
		{/if}
		{#if files != null}
			{#each files as file (file.url)}
				<Line data={file} isPolleg={data.isPolleg.includes(file.name)} />
			{/each}
		{/if}
	</div>
</main>

<FuzzySearch data={data.fuzzy} bind:this={fuzzy} />
