<!--
SPDX-FileCopyrightText: 2024 - 2026 Eyad Issa <eyadlorenzo@gmail.com>

SPDX-License-Identifier: AGPL-3.0-or-later
-->
<script lang="ts">
	import { resolve } from '$app/paths';

	import type { Fuzzy, FuzzyFile } from '$lib/api';
	import Fuse from 'fuse.js';
	import { onMount } from 'svelte';

	let { data }: { data: Fuzzy } = $props();

	/** If the search modal is visible */
	let visible = $state(false);
	let query = $state('');

	let fuse = $derived(new Fuse(data, { keys: ['name'] }));
	let results = $derived(fuse ? fuse.search(query, { limit: 7 }) : []);

	let focusIdx = $state(0);
	const resetFocus = () => (focusIdx = 0);
	const setFocusIdx = (idx: number) => {
		focusIdx = idx;
	};

	// svelte-ignore non_reactive_update
	let resultList: HTMLUListElement;
	let queryInput: HTMLInputElement;

	export function show() {
		visible = !visible;
		setTimeout(() => {
			if (queryInput) queryInput.focus();
		}, 100);
	}

	function getFuzzyHref(result: FuzzyFile) {
		if (result.mime === 'text/statik-link') {
			return result.url;
		}

		const url = new URL(result.url);

		// @ts-expect-error - the way in which SvelteKit handles
		// the type safety of `resolve` does not allow us to resolve
		// artibrary paths.
		return resolve(url.pathname);
	}

	function keydown(e: KeyboardEvent) {
		if (e.key === 'Escape') {
			if (visible) visible = false;
		} else if (e.key === 'k' && e.ctrlKey) {
			e.preventDefault(); // prevent the browser's search bar from opening

			if (!visible) visible = true;
			setTimeout(() => {
				if (queryInput) queryInput.focus();
			}, 100);
		} else if (e.key === 'ArrowDown' && resultList) {
			e.preventDefault();
			setFocusIdx(focusIdx < resultList.children.length - 1 ? focusIdx + 1 : focusIdx);
		} else if (e.key === 'ArrowUp' && resultList) {
			e.preventDefault();
			setFocusIdx(focusIdx > 0 ? focusIdx - 1 : 0);
		} else if (e.key === 'Enter' && resultList != null) {
			e.preventDefault();
			const activeEL = resultList.children[focusIdx] as HTMLLIElement;
			const aEl = activeEL.querySelector('a') as HTMLAnchorElement;
			if (aEl) {
				aEl.click();
			}
		}
	}

	onMount(() => {
		window.addEventListener('keydown', keydown);
		return () => window.removeEventListener('keydown', keydown);
	});
</script>

<input type="checkbox" id="my-modal" class="modal-toggle" checked={visible} />

<label for="my-modal" class="modal cursor-pointer" role="search">
	<label class="modal-box relative p-2">
		<input
			class="input input-ghost w-full focus:outline-hidden focus:border-0 mb-0"
			type="text"
			placeholder="Search..."
			bind:this={queryInput}
			bind:value={query}
			oninput={resetFocus}
		/>

		{#if results.length !== 0}
			<div class="divider mt-0 mb-2"></div>

			<ul class="menu p-2 w-full" bind:this={resultList}>
				{#each results as result, i (result.item.path)}
					{@const href = getFuzzyHref(result.item)}
					<li>
						<a
							{href}
							class={['flex', i === focusIdx && 'menu-focus']}
							onmouseenter={() => setFocusIdx(i)}
						>
							<span class="grow">
								{result.item.name}
							</span>

							{#if i === focusIdx}
								<span><kbd class="kbd kbd-xs">enter</kbd> to jump </span>
							{/if}
						</a>
					</li>
				{/each}
			</ul>
		{/if}
	</label>
</label>
