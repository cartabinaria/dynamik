<!-- 
SPDX-FileCopyrightText: 2025 Alice Benatti <alice17bee@gmail.com>

SPDX-License-Identifier: AGPL-3.0-or-later
-->

<script lang="ts">
	import { Markdown } from 'carta-md';
	import { carta } from '$lib/carta-config';
	import { onMount, tick } from 'svelte';

	const { value }: { value: string } = $props();

	let mounted = $state(false);
	let container: HTMLDivElement | undefined = $state();
	let lastRenderedValue = '';

	onMount(() => {
		mounted = true;
	});

	// re-render only when value changes
	$effect(() => {
		if (mounted && value && value !== lastRenderedValue) {
			lastRenderedValue = value;
			tick().then(() => {
				// Force a clean re-render
				if (container) {
					container.innerHTML = '';
				}
			});
		}
	});
</script>

{#if mounted && value}
	<div bind:this={container}>
		{#key value}
			<Markdown {carta} {value} />
		{/key}
	</div>
{/if}
