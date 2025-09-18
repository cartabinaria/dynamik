<script lang="ts">
	import { resolve } from '$app/paths';
import { page } from '$app/stores';
	import LoginButton from './LoginButton.svelte';

	let { goback = true, title }: { goback?: boolean; title: string } = $props();
</script>

<nav class="navbar flex bg-base-200 rounded-box shadow-xs px-5 mb-5">
	<div class="navbar-start flex items-center">
		<a href="{resolve('/')}" class="btn btn-ghost btn-primary rounded-lg btn-sm md:btn-md" title="Home" aria-label="Home">
			<span class="icon-[ic--round-home] text-lg"></span>
			<p class="hidden md:block">Home</p>
		</a>
		{#if goback}
			<button
				class="btn btn-ghost btn-primary rounded-lg btn-sm md:btn-md"
				title="Indietro"
				aria-label="Indietro"
				onclick={() => history.back()}
			>
				<span class="icon-[akar-icons--arrow-back-thick-fill] text-lg"></span>
				<p class="hidden md:block">Go back</p>
			</button>
		{/if}
	</div>
	<div class="navbar-center">
		<h1 class="text-md md:text-xl font-semibold text-base-content">{title}</h1>
	</div>

	<div class="navbar-end">
		<LoginButton url={$page.url} />
	</div>
</nav>
