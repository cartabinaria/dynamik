<!-- SafeMarkdown.svelte -->
<script lang="ts">
	import { Markdown } from 'carta-md';
	import { carta } from '$lib/carta-config';
	import { onMount, tick } from 'svelte';

	export let value: string;

	let mounted = false;
	let container: HTMLDivElement;
	let lastRenderedValue = '';

	onMount(() => {
		mounted = true;
	});

	// Solo re-renderizza se il valore è effettivamente cambiato
	$: if (mounted && value && value !== lastRenderedValue) {
		lastRenderedValue = value;
		tick().then(() => {
			// Forza un re-render pulito
			if (container) {
				container.innerHTML = '';
			}
		});
	}
</script>

{#if mounted && value}
	<div bind:this={container}>
		{#key value}
			<Markdown {carta} {value} />
		{/key}
	</div>
{/if}
