<script lang="ts">
	import type { PageData } from './$types';

	import { bundledLanguagesInfo, codeToHtml } from 'shiki';

	let { data }: { data: PageData } = $props();

	let selectedLang = $derived.by(() => {
		const lang = data.extension;
		const selectedLangs = bundledLanguagesInfo.filter(
			(bundle) => bundle.id === lang || bundle.aliases?.includes(lang)
		);

		if (selectedLangs.length === 0) {
			console.error(`Language not found: ${lang}`);
			return null;
		}

		return selectedLangs[0].id;
	});

	let formattedCode = $state('');

	$effect(() => {
		if (selectedLang == null) return;

		codeToHtml(data.body, {
			lang: selectedLang,
			theme: 'dark-plus'
		})
			.then((html) => {
				formattedCode = html;
			})
			.catch((error) => {
				console.error('Error formatting code:', error);
				formattedCode = `Error formatting code: ${error.message}`;
			});
	});
</script>

<div>
	<!-- eslint-disable-next-line svelte/no-at-html-tags -->
	<pre>{@html formattedCode}</pre>
</div>

<style>
	:global(pre) {
		padding: 1rem;
	}
</style>
