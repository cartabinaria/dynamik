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

	function genTitle(url: string) {
		const part = url.split('/');
		return part[part.length - 1].split('?')[0];
	}
	$: title = genTitle(data.url);

	function genIframeUrl(baseUrl: string) {
		const params = $page.url.searchParams;

		if (params.has('page')) {
			const pageParam = params.get('page');
			// if page is a number, append it to the url (security)
			const pageParamNumber = Number(pageParam);
			if (!isNaN(pageParamNumber)) {
				baseUrl += `#page=${pageParamNumber}`;
			}
		}

		return baseUrl;
	}
	$: iframeUrl = genIframeUrl(data.url);
</script>

<svelte:head>
	<title>{title}</title>
	<meta property="og:title" content={title} />
</svelte:head>

<Breadcrumbs url={$page.url} borderRadius={null} />

<iframe bind:this={iframe} title="Embedded resource" src={iframeUrl} class="h-full w-full"></iframe>

<style>
	:global(html),
	:global(body) {
		height: 100%;
	}
</style>
