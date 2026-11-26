<!--
SPDX-FileCopyrightText: 2023 - 2025 Eyad Issa <eyadlorenzo@gmail.com>
SPDX-FileCopyrightText: 2023 Luca Tagliavini <luca@teapot.ovh>

SPDX-License-Identifier: AGPL-3.0-or-later
-->

<script lang="ts">
	import type { PageProps } from './$types';

	import {
		bundledLanguagesInfo,
		codeToTokens,
		type BundledLanguage,
		type SpecialLanguage,
		type TokensResult
	} from 'shiki';

	let { data }: PageProps = $props();
	let { extension } = $derived(data);

	let formattedTokens: TokensResult | null = $state(null);
	let errorMessage: string | null = $state(null);

	$effect(() => {
		let language: BundledLanguage | SpecialLanguage = 'plaintext';

		const selectedLangs = bundledLanguagesInfo.filter(
			(bundle) => bundle.id === extension || bundle.aliases?.includes(extension)
		);

		if (selectedLangs.length !== 0) {
			language = selectedLangs[0].id as BundledLanguage;
		}

		codeToTokens(data.body, {
			lang: language,
			theme: 'dark-plus'
		})
			.then((it) => (formattedTokens = it))
			.catch((error) => {
				console.error('Error formatting code:', error);
				errorMessage = `Error formatting code: ${error.message}`;
			});
	});
</script>

<div>
	{#if errorMessage != null}
		<p class="error-message">{errorMessage}</p>
	{:else if formattedTokens != null}
		<div
			class="font-mono m-2 md:m-4 p-4 rounded-box overflow-x-auto whitespace-pre"
			style="background-color: {formattedTokens.bg}; color: {formattedTokens.fg};"
		>
			{#each formattedTokens.tokens as tokenArr, i (i)}
				<span class="inline-block w-10 text-right select-none opacity-60 mr-2">{i + 1}</span
				>{#each tokenArr as token, j (j)}<span
						style="color: {token.color}; font-style: {token.fontStyle};">{token.content}</span
					>{/each}<br />
			{/each}
		</div>
	{:else}
		<p class="text-4xl font-bold flex justify-center items-center h-64">Loading...</p>
	{/if}
</div>
