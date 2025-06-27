<script lang="ts">
	import type { PageData } from './$types';
	import { page } from '$app/state';
	import { onMount } from 'svelte';
	import { teachingsFilter, type Degree, type Teaching } from '$lib/teachings';
	import { getLoginUrl, getWhoAmI } from '$lib/upld';
	import ListTeaching from './ListTeaching.svelte';
	import type { TeachingsBatch } from './types';
	import { MAX_YEARS_FOR_DEGREE, RISORSE_BASE_URL } from '$lib/const';

	let { data }: { data: PageData } = $props();

	let activeYears: string[] = $state([]);

	type LoginState = { username: string; name: string; avatarUrl: string } | { error: string };
	let loginState: Promise<LoginState> | undefined = $state(undefined);

	onMount(async () => {
		activeYears = (await data.streaming?.activeTeachings) ?? [];
		loginState = getWhoAmI(fetch);
	});

	function namesToTeachings(names: string[]): Teaching[] {
		return names.map(data.teachings.get, data.teachings).filter((x): x is Teaching => !!x);
	}

	function reorganizeTeachings(degree: Degree) {
		if (degree.teachings != null && degree.teachings.length == 0)
			return { mandatory: [], electives: [] };
		const mandatory: TeachingsBatch[] = [];
		const electives: TeachingsBatch[] = [];

		for (let i = 0; i <= MAX_YEARS_FOR_DEGREE; i++) {
			const m = teachingsFilter(degree, i, true);
			const e = teachingsFilter(degree, i, false);

			if (m != null && m.length != 0) mandatory.push({ year: i, teachings: namesToTeachings(m) });
			if (e != null && e.length != 0) electives.push({ year: i, teachings: namesToTeachings(e) });
		}

		return { mandatory, electives };
	}

	let reorganizedTeachings = $derived(reorganizeTeachings(data.degree));
</script>

<svelte:head>
	<title>{data.degree?.name}</title>
	<!-- OG meta graph -->
	<meta property="og:title" content={data.degree?.name} />
	<meta name="url" property="og:url" content="{RISORSE_BASE_URL}/{data.degree?.name}" />
	<meta name="description" property="og:description" content="Risorse di {data.degree?.name}" />
</svelte:head>

<div class="max-w-5xl p-4 mx-auto">
	<nav class="navbar flex bg-base-200 text-neutral-content rounded-box shadow-xs px-5 mb-5">
		<div class="navbar-start flex items-center">
			<a href="/" class="btn btn-outline" title="Home" aria-label="Home">
				<span class="icon-[ic--round-home]"></span>
				Home
			</a>
		</div>
		<div class="navbar min-h-0 p-0 justify-center items-center">
			<h1 class="flex flex-wrap text-xl text-center font-semibold text-base-content">
				{data.degree.name}
			</h1>
		</div>

		<div class="navbar-end">
			{#if loginState != null}
				{#await loginState then login}
					{#if 'error' in login}
						<a class="btn btn-square btn-ghost" href={getLoginUrl(page.url)}> Login </a>
					{:else}
						<img src={login.avatarUrl} alt="User avatar" class="w-10 rounded-xl" />
					{/if}
				{/await}
			{/if}
		</div>
	</nav>
	<ListTeaching
		years={reorganizedTeachings.mandatory}
		activeYears={namesToTeachings(activeYears)}
		title={''}
		from={data.degree.id}
	/>
	<ListTeaching
		title="facoltativi"
		years={reorganizedTeachings.electives}
		activeYears={namesToTeachings(activeYears)}
		from={data.degree.id}
	/>
</div>
