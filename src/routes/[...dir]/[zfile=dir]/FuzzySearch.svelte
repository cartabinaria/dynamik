<script lang="ts">
	import { base } from '$app/paths';
	import type { Fuzzy, FuzzyFile } from '$lib/api';
	import Fuse from 'fuse.js';

	export let data: Fuzzy;

	/** If the search modal is visible */
	let visible = false;

	$: fuse = new Fuse(data, { keys: ['name'] });
	let query = '';
	$: results = fuse ? fuse.search(query, { limit: 7 }) : [];

	let focusIdx = 0;
	$: {
		// every time the search query changes, reset the active element
		// eslint-disable-next-line @typescript-eslint/no-unused-expressions
		query;
		focusIdx = 0;
	}

	let queryInput: HTMLInputElement;
	let resultList: HTMLUListElement;

	export function show() {
		visible = !visible;
		setTimeout(() => {
			queryInput.focus();
		}, 100);
	}

	function getFuzzyHref(result: FuzzyFile) {
		if (result.mime === 'text/statik-link') {
			return result.url;
		}

		return base + new URL(result.url, location.origin).pathname;
	}

	function keydown(e: KeyboardEvent) {
		if (e.key === 'Escape') {
			if (visible) visible = false;
		} else if (e.key === 'k' && e.ctrlKey) {
			e.preventDefault(); // prevent the browser's search bar from opening

			if (!visible) visible = true;
			setTimeout(() => {
				queryInput.focus();
			}, 100);
		} else if (e.key === 'ArrowDown' && resultList) {
			e.preventDefault();
			focusIdx = focusIdx < resultList.children.length - 1 ? focusIdx + 1 : focusIdx;
		} else if (e.key === 'ArrowUp' && resultList) {
			e.preventDefault();
			focusIdx = focusIdx > 0 ? focusIdx - 1 : 0;
		} else if (e.key === 'Enter' && resultList) {
			e.preventDefault();
			const activeEL = resultList.children[focusIdx] as HTMLLIElement;
			const aEl = activeEL.querySelector('a') as HTMLAnchorElement;
			if (aEl) {
				aEl.click();
			}
		}
	}
</script>

<svelte:body on:keydown={keydown} />

<input type="checkbox" id="my-modal" class="modal-toggle" checked={visible} />

<label for="my-modal" class="modal cursor-pointer" role="search">
	<label class="modal-box relative p-2">
		<input
			class="input input-ghost w-full focus:outline-none focus:border-0 mb-0"
			type="text"
			placeholder="Search..."
			bind:this={queryInput}
			bind:value={query}
		/>

		{#if results.length !== 0}
			<div class="divider mt-0 mb-2"></div>

			<ul class="menu p-2" bind:this={resultList}>
				{#each results as result, i}
					{@const href = getFuzzyHref(result.item)}
					<li>
						<a {href} class:focus={i === focusIdx} class="flex">
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
