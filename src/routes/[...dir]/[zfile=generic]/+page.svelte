<script lang="ts">
	import { onMount } from 'svelte';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();
	let title = $derived.by(() => {
		const part = data.url.split('/');
		return part[part.length - 1].split('?')[0];
	});

	let iframe: HTMLIFrameElement;
	onMount(() => {
		// Focus the iframe
		iframe.contentWindow?.focus();
	});
</script>

<svelte:head>
	<title>{title}</title>
	<meta property="og:title" content={title} />
</svelte:head>

<iframe bind:this={iframe} title="Embedded resource" src={data.url} class="h-full w-full"></iframe>

<style>
	:global(html),
	:global(body) {
		height: 100%;
	}
</style>
