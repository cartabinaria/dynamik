<script lang="ts">
	import { page } from '$app/state';

	import { teachingsFilter, type Degree } from '$lib/teachings';
	import { doneFiles, anyFileDone } from '$lib/todo-file';

	import Line from '$lib/components/Line.svelte';
	import Breadcrumbs from '$lib/components/Breadcrumbs.svelte';
	import FuzzySearch from './FuzzySearch.svelte';

	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();

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

	// --- Sorting ---
	let reverseMode = $state(true); // partiamo in ordine A-Z

	/**
	 * Inverte l'ordine di visualizzazione delle risorse
	 */
	function toggleReverse() {
		reverseMode = !reverseMode;
	}

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
	let isDone = $derived(anyFileDone(data.manifest.files?.map((f) => f.url) ?? []));

	function cleanDone() {
		doneFiles.update((old) => {
			data.manifest.files?.forEach((f) => {
				old[f.url] = false;
			});
			return old;
		});
	}
</script>

<svelte:head>
	<title>{title}</title>
	<meta property="og:title" content={title} />
</svelte:head>

<main class="max-w-6xl min-w-fit p-4 mx-auto">
	<Breadcrumbs
		{degree}
		url={page.url}
		onfuzzy={() => fuzzy.show()}
		uploadUrl={page.url.pathname + '/upload'}
	/>

	<div class="flex flex-1 justify-start mr-4 mb-3 mt-4">
		{#if $isDone}
			<button
				class="lg:ml-2 p-1 flex mr-2 items-center"
				onclick={cleanDone}
				title="Clean all done files in this page"
				aria-label="Clean all done files in this page"
			>
				<span class="text-warning text-xl icon-[solar--broom-bold-duotone]"></span>
			</button>
		{/if}
		<!-- Reverse Mode -->
		<button class="lg:ml-2 p-1 flex items-center rounded-xl text-primary" onclick={toggleReverse}>
			Nome
			<span class="ms-2 text-xl icon-[solar--sort-vertical-bold-duotone]" class:flip={reverseMode}
			></span>
		</button>
	</div>

	<div
		class="grid gap-5 md:grid-cols-[min-content_auto_min-content_max-content] grid-cols-[1fr_auto_min-content] mx-4 text-lg"
	>
		{#if data.manifest.directories != null}
			{@const directories = data.manifest.directories.sort((a, b) => a.name.localeCompare(b.name))}
			{#if !reverseMode}
				{#each directories.reverse() as dir (dir.path)}
					<Line data={dir} />
				{/each}
			{:else}
				{#each directories as dir (dir.path)}
					<Line data={dir} />
				{/each}
			{/if}
		{/if}
		{#if data.manifest.files != null}
			{@const files = data.manifest.files.sort((a, b) => a.name.localeCompare(b.name))}
			{#if !reverseMode}
				{#each files.reverse() as file (file.name)}
					<Line data={file} />
				{/each}
			{:else}
				{#each files as file (file.name)}
					<Line data={file} />
				{/each}
			{/if}
		{/if}
	</div>
</main>

<FuzzySearch data={data.fuzzy} bind:this={fuzzy} />

<style>
	.flip {
		transform: scaleX(-1) scaleY(-1);
	}
</style>
