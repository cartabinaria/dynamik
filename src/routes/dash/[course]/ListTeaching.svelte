<!--
SPDX-FileCopyrightText: 2023 - 2024 Alice Benatti <alice17bee@gmail.com>
SPDX-FileCopyrightText: 2023 - 2024 Eyad Issa <eyadlorenzo@gmail.com>
SPDX-FileCopyrightText: 2023 Alice Benatti <alice17bee@gmail.com>
SPDX-FileCopyrightText: 2023 Stefano Volpe <stefano.volpe@student.uva.nl>
SPDX-FileCopyrightText: 2024 Samuele Musiani <samu@teapot.ovh>

SPDX-License-Identifier: AGPL-3.0-or-later
-->

<script lang="ts">
	import type { Teaching } from '$lib/teachings';
	import { base } from '$app/paths';
	import type { TeachingsBatch } from './types';

	import IconAkarIconsPeopleGroup from '@iconify-svelte/akar-icons/people-group';

	type Props = {
		years: TeachingsBatch[];
		activeYears: Teaching[];
		title: string;
		from?: string;
	};

	let { years, activeYears, title, from }: Props = $props();

	function getUrl(teaching: Teaching) {
		let url = base + '/' + teaching.url;
		if (from != null) url += '?from=' + from;
		return url;
	}
</script>

{#snippet teaching(teaching: Teaching)}
	{@const disabled = !activeYears.includes(teaching)}
	<li
		class:disabled
		class="flex flex-row border-base-content items-center content-center m-2 border rounded-md join w-fit"
	>
		<a
			href={disabled ? null : getUrl(teaching)}
			class="text-center text-lg text-balance p-2 flex join-item"
		>
			{teaching.name ? teaching.name : teaching.url}
		</a>

		{#if teaching.chat != null && teaching.chat !== ''}
			<a
				href={disabled ? null : 'https://' + teaching.chat}
				class="join-item border-l border-base-content"
				title="Link alla community"
				aria-label="Link alla community"
			>
				<IconAkarIconsPeopleGroup class="w-6 h-6" />
			</a>
		{/if}
	</li>
{/snippet}

<ul class="menu p-2">
	{#each years as year (year.year)}
		{#if year.teachings.length > 0}
			{@const type = year.year != 0 ? year.year.toString() + ' anno' : 'Generali'}
			<li class="menu-title">
				<span class="text-2xl mt-5 italic">{type} {title}</span>
			</li>
			<div class="divider mt-0"></div>
			<div class="flex flex-row flex-wrap">
				{#each year.teachings as t (t.name)}
					{#if t}
						{@render teaching(t)}
					{/if}
				{/each}
			</div>
		{/if}
	{/each}
</ul>
