<script lang="ts">
	import { page } from '$app/stores';
	import { goto } from '$app/navigation';
	import { browser } from '$app/environment';

	export let currentLang: 'it' | 'en';

	const switchLanguage = (lang: 'it' | 'en') => {
		if (browser) {
			localStorage.setItem('dynamik-language-preference', lang);
		}

		const targetUrl =
			lang === 'en'
				? '/en' + $page.url.pathname.replace('/en', '')
				: $page.url.pathname.replace('/en', '');
		goto(targetUrl);
	};
</script>

<div class="dropdown dropdown-end">
	<div tabindex="0" role="button" class="btn btn-ghost btn-sm">
		<span class="icon-[solar--global-outline] text-lg"></span>
		<span class="hidden sm:inline">{currentLang === 'it' ? 'Italiano' : 'English'}</span>
		<span class="icon-[solar--alt-arrow-down-outline] text-sm"></span>
	</div>
	<ul tabindex="0" class="dropdown-content z-[1] menu p-2 shadow bg-base-100 rounded-box w-52">
		<li class:disabled={currentLang === 'it'}>
			<button on:click={() => switchLanguage('it')} class="flex items-center gap-2">
				🇮🇹 Italiano
				{#if currentLang === 'it'}
					<span class="badge badge-primary badge-xs">current</span>
				{/if}
			</button>
		</li>
		<li class:disabled={currentLang === 'en'}>
			<button on:click={() => switchLanguage('en')} class="flex items-center gap-2">
				🇬🇧 English
				{#if currentLang === 'en'}
					<span class="badge badge-primary badge-xs">current</span>
				{/if}
			</button>
		</li>
	</ul>
</div>

<style>
	.disabled {
		@apply opacity-50 pointer-events-none;
	}
</style>
