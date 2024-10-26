<script lang="ts">
	import type { Teaching } from '$lib/teachings';
	import { base } from '$app/paths';
	import type { TeachingsBatch } from './types';

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
		class="flex flex-row xs:flex-1 justify-center border-base-content items-center content-center m-2 border-2 rounded-md join"
	>
		<a
			href={disabled ? null : getUrl(teaching)}
			class="flex flex-wrap max-w-xs text-center text-lg join-item h-full justify-center content-center"
		>
			{teaching.name ? teaching.name : teaching.url}
		</a>
		{#if teaching.chat != null && teaching.chat !== ''}
			<a
				href={disabled ? null : 'https://' + teaching.chat}
				class="flex text-center join-item border-l-2 border-base-content h-full justify-center"
				title="Link alla community"
				aria-label="Link alla community"
			>
				<span class="text-2xl icon-[akar-icons--people-group]"></span>
			</a>
		{/if}
	</li>
{/snippet}

<ul class="menu p-2">
	{#each years as year}
		{#if year.teachings.length > 0}
			{@const type = year.year != 0 ? year.year.toString() + ' anno' : 'Generali'}
			<li class="menu-title">
				<span class="text-2xl mt-5 italic">{type} {title}</span>
			</li>
			<div class="divider mt-0"></div>
			<div class="flex flex-row flex-wrap">
				{#each year.teachings as t}
					{#if t}
						{@render teaching(t)}
					{/if}
				{/each}
			</div>
		{/if}
	{/each}
</ul>
