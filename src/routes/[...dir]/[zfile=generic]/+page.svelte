<script lang="ts">
	import { onMount } from 'svelte';
	import type { PageData } from './$types';

	export let data: PageData;

	let iframe: HTMLIFrameElement;
	onMount(() => {
		// Focus the iframe
		iframe.contentWindow?.focus();
	});

	$: title = getTitle(data.url);

	function getTitle(url: string) {
		const part = url.split('/');
		return part[part.length - 1].split('?')[0];
	}
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
