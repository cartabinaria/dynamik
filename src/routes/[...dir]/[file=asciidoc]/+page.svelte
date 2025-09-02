<!--
SPDX-FileCopyrightText: 2023 - 2025 Eyad Issa <eyadlorenzo@gmail.com>

SPDX-License-Identifier: AGPL-3.0-or-later
-->

<script lang="ts">
	import { onMount } from 'svelte';
	import type { PageData } from './$types';
	// @ts-expect-error - katex auto-render is not typed
	import autoRender from 'katex/dist/contrib/auto-render.mjs';
	import tocbot from 'tocbot';

	let { data }: { data: PageData } = $props();

	let docContainer: HTMLElement;

	let html = $state('');

	onMount(() => {
		// we import asciidoctor in the head, so no types
		// @ts-expect-error - asciidoctor is not typed
		// eslint-disable-next-line no-undef
		const asciidoctor = new Asciidoctor();
		html = asciidoctor.convert(data.body, { attributes: { showtitle: true } }) as string;

		autoRender(docContainer, { throwOnError: false });

		// build the table of contents by finding all the headings
		tocbot.init({
			tocSelector: '#toc',
			contentSelector: '#markdown',
			headingSelector: 'h2, h3, h4',
			orderedList: false
		});
	});
</script>

<svelte:head>
	<script
		src="https://cdn.jsdelivr.net/npm/@asciidoctor/core@2.2.6/dist/browser/asciidoctor.min.js"
	></script>
</svelte:head>

<main class="container m-auto grid gap-4 grid-cols-[4fr_1fr]">
	<section class="prose m-auto" id="markdown" role="document" bind:this={docContainer}>
		<!-- eslint-disable-next-line svelte/no-at-html-tags -->
		{@html html}
	</section>
	<section class="prose" id="toc" role="contentinfo"></section>
</main>

<style>
	/* KaTeX CSS is now imported globally in +layout.svelte */
</style>
