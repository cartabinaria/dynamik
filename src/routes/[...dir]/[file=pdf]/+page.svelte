<script lang="ts">
	import { onMount } from 'svelte';
	import type { PageData } from './$types';
	import Breadcrumbs from '$lib/components/Breadcrumbs.svelte';
	import { page } from '$app/stores';

	export let data: PageData;

	let iframe: HTMLIFrameElement;
	onMount(() => {
		iframe.contentWindow?.focus(); // Focus the iframe
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

<Breadcrumbs url={$page.url} borderRadius={null} />

<iframe bind:this={iframe} title="Embedded resource" src={data.url} class="h-full w-full"></iframe>

<style>
	:global(html),
	:global(body) {
		height: 100%;
	}
</style>
