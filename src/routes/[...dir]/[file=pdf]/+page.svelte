<!--
SPDX-FileCopyrightText: 2024 - 2025 Eyad Issa <eyadlorenzo@gmail.com>

SPDX-License-Identifier: AGPL-3.0-or-later
-->

<script lang="ts">
	import { onMount } from 'svelte';
	import type { PageData } from './$types';
	import Breadcrumbs from '$lib/components/Breadcrumbs.svelte';
	import { page } from '$app/state';

	let { data }: { data: PageData } = $props();

	let iframe: HTMLIFrameElement;
	onMount(() => {
		iframe.contentWindow?.focus(); // Focus the iframe
	});

	function genTitle(url: string) {
		const part = url.split('/');
		return part[part.length - 1].split('?')[0];
	}
	let title = $derived(genTitle(data.url));

	function genIframeUrl(baseUrl: string, pageUrl: URL) {
		const params = pageUrl.searchParams;

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
	let iframeUrl = $derived(genIframeUrl(data.url, page.url));
</script>

<svelte:head>
	<title>{title}</title>
	<meta property="og:title" content={title} />
</svelte:head>

<Breadcrumbs url={page.url} borderRadius={null} />

<iframe bind:this={iframe} title="Embedded resource" src={iframeUrl} class="h-full w-full"></iframe>

<style>
	:global(html),
	:global(body) {
		height: 100%;
	}
</style>
