<!--
SPDX-FileCopyrightText: 2024 - 2026 Eyad Issa <eyadlorenzo@gmail.com>

SPDX-License-Identifier: AGPL-3.0-or-later
-->

<script lang="ts">
	import { onMount } from 'svelte';
	import type { PageData } from './$types';
	import Breadcrumbs from '$lib/components/Breadcrumbs.svelte';
	import { page } from '$app/state';
	import IconLucideMaximize from '@iconify-svelte/lucide/maximize';
	import IconLucideMinimize from '@iconify-svelte/lucide/minimize';

	let { data }: { data: PageData } = $props();

	let showNavbar = $state(true);
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

<div class="flex flex-col h-screen w-full relative overflow-hidden">
	{#if showNavbar}
		<div class="shrink-0">
			<Breadcrumbs url={page.url} borderRadius={null} />
		</div>
	{/if}

	<div class="grow relative">
		<iframe
			bind:this={iframe}
			title="Embedded resource"
			src={iframeUrl}
			class="absolute inset-0 h-full w-full border-none"
		></iframe>

		<button
			class="absolute bottom-6 right-6 btn btn-circle btn-primary shadow-lg opacity-50 hover:opacity-100 transition-opacity z-50"
			onclick={() => (showNavbar = !showNavbar)}
			title={showNavbar ? 'Nascondi Navbar' : 'Mostra Navbar'}
			aria-label={showNavbar ? 'Nascondi Navbar' : 'Mostra Navbar'}
		>
			{#if showNavbar}
				<IconLucideMinimize class="w-6 h-6" />
			{:else}
				<IconLucideMaximize class="w-6 h-6" />
			{/if}
		</button>
	</div>
</div>

<style>
	:global(html),
	:global(body) {
		height: 100%;
		overflow: hidden;
	}
</style>
