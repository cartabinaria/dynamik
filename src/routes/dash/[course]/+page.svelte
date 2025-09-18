<!--
SPDX-FileCopyrightText: 2023 - 2024 Alice Benatti <alice17bee@gmail.com>
SPDX-FileCopyrightText: 2023 - 2025 Eyad Issa <eyadlorenzo@gmail.com>
SPDX-FileCopyrightText: 2023 Erik <kocierik@gmail.com>
SPDX-FileCopyrightText: 2023 Stefano Volpe <stefano.volpe@student.uva.nl>
SPDX-FileCopyrightText: 2023 kocierik <kocierik@gmail.com>
SPDX-FileCopyrightText: 2024 Samuele Musiani <samu@teapot.ovh>

SPDX-License-Identifier: AGPL-3.0-or-later
-->

<script lang="ts">
	import type { PageData } from './$types';
	import { onMount } from 'svelte';
	import { teachingsFilter, type Degree, type Teaching } from '$lib/teachings';
	import { getWhoAmI } from '$lib/upld';
	import ListTeaching from './ListTeaching.svelte';
	import type { TeachingsBatch } from './types';
	import { MAX_YEARS_FOR_DEGREE, RISORSE_BASE_URL } from '$lib/const';
	import Navbar from '$lib/components/Navbar.svelte';

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
	<Navbar title={data.degree?.name} goback={false}></Navbar>

	<ListTeaching
		years={reorganizedTeachings.mandatory}
		activeYears={namesToTeachings(activeYears)}
		title=""
		from={data.degree.id}
	/>
	<ListTeaching
		title="facoltativi"
		years={reorganizedTeachings.electives}
		activeYears={namesToTeachings(activeYears)}
		from={data.degree.id}
	/>
</div>
