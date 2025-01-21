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

	$effect(() => {
		if (selectedLang == null) return;

		codeToHtml(data.body, {
			lang: selectedLang,
			theme: 'dark-plus'
		}).then((html) => {
			container.innerHTML = html;
		});
	});

	let container: HTMLElement;
</script>

<div bind:this={container}>
	<pre>{data.body}</pre>
</div>

<style>
	:global(pre) {
		padding: 1rem;
	}
</style>
