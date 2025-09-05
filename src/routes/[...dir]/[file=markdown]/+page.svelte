<!--
SPDX-FileCopyrightText: 2023 - 2025 Eyad Issa <eyadlorenzo@gmail.com>
SPDX-FileCopyrightText: 2023 Luca Tagliavini <luca@teapot.ovh>

SPDX-License-Identifier: AGPL-3.0-or-later
-->

<script lang="ts">
	import type { PageData } from './$types';
	import tocbot from 'tocbot';
	// @ts-expect-error - katex auto-render is not typed
	import autoRender from 'katex/dist/contrib/auto-render.mjs';
	import { formatDate } from '$lib/date';
	import settings from '$lib/settings';
	import { EDIT_URLS } from '../../../lib/const';
	import { page } from '$app/stores';
	import { fade } from 'svelte/transition';

	let { data }: { data: PageData } = $props();

	let markdown: HTMLElement;
	let toc: HTMLElement;
	let tocContainer: HTMLElement;

	let menuOpen = $state(false);

	$effect(() => {
		autoRender(markdown, {
			delimiters: [
				{ left: '$$', right: '$$', display: true },
				{ left: '\\[', right: '\\]', display: true },
				{ left: '$', right: '$', display: false },
				{ left: '\\(', right: '\\)', display: false }
			]
		});

		// build the table of contents by finding all the headings
		tocbot.init({
			tocSelector: '#toc',
			contentSelector: '#markdown',
			headingSelector: 'h2, h3, h4',
			orderedList: false
		});
	});
</script>

<main class="container m-auto flex">
	<div class="overflow-y-scroll max-h-screen grow">
		<div class="flex float-right sticky top-5 justify-end m-5">
			<button
				onclick={() => {
					if (!menuOpen) tocContainer.scrollTo(0, 0);
					menuOpen = !menuOpen;
				}}
				class="btn btn-ghost text-2xl"
			>
				{#if menuOpen}
					<span class="icon-[material-symbols--close-rounded]"></span>
				{:else}
					<span class="icon-[material-symbols--menu-rounded]"></span>
				{/if}
			</button>
		</div>
		<section class="prose md:mx-auto mt-10 mx-6" id="markdown" bind:this={markdown} role="document">
			<!-- eslint-disable-next-line svelte/no-at-html-tags -->
			{@html data.markdown}

			<div class="my-4 prose prose-slate italic max-w-none text-center mx-10">
				{#await data.info.fileInfo then info}
					{@const editUrls = EDIT_URLS($page.url.pathname)}
					<p transition:fade>
						<span>
							Last edited on
							<span>{formatDate($settings, info.time)}</span>
							<span>
								- View on
								<a href={editUrls.github} target="_blank" rel="noopener noreferrer"> github.com </a>
								- Edit on
								<a href={editUrls.github_edit} target="_blank" rel="noopener noreferrer">
									github.com
								</a>
								or on
								<a href={editUrls.github_dev} target="_blank" rel="noopener noreferrer">
									github.dev
								</a>
							</span>
						</span>
					</p>
				{/await}
			</div>
		</section>
	</div>

	<div
		class="overflow-y-scroll max-h-screen max-w-sm transition-all ml-4"
		bind:this={tocContainer}
		class:tocHidden={!menuOpen}
	>
		<section class="prose mt-10" id="toc" bind:this={toc} role="contentinfo"></section>
	</div>
</main>

<style>
	.tocHidden {
		max-width: 0;
		margin: 0;
	}

	:global(.toc-list-item) {
		list-style: none;
	}

	:global(.toc-link) {
		text-decoration: none;
	}

	:global(.toc-link:hover) {
		text-decoration: underline;
	}

	:global(.node-name--H2) {
		font-weight: bold;
	}

	.prose {
		max-width: 100ch;
	}
</style>
