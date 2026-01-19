<!--
SPDX-FileCopyrightText: 2026 Eyad Issa <eyadlorenzo@gmail.com>

SPDX-License-Identifier: AGPL-3.0-or-later
-->

<script lang="ts">
	import { resolve } from '$app/paths';

	import IconIcRoundHome from '@iconify-svelte/ic/round-home';
	import IconAkarIconsArrowBackThickFill from '@iconify-svelte/akar-icons/arrow-back-thick-fill';

	let { goback = true, title }: { goback?: boolean; title: string } = $props();
</script>

<nav class="navbar flex bg-base-200 rounded-box shadow-xs px-5 mb-5">
	<div class="navbar-start flex items-center">
		<a
			href={resolve('/')}
			class="btn btn-ghost btn-primary rounded-lg btn-sm md:btn-md flex items-center"
			title="Home"
			aria-label="Home"
		>
			<IconIcRoundHome class="w-4 h-4" />
			<p class="hidden md:block">Home</p>
		</a>
		{#if goback}
			<button
				class="btn btn-ghost btn-primary rounded-lg btn-sm md:btn-md"
				title="Indietro"
				aria-label="Indietro"
				onclick={() => history.back()}
			>
				<IconAkarIconsArrowBackThickFill class="w-4 h-4" />
				<p class="hidden md:block">Go back</p>
			</button>
		{/if}
	</div>
	<div class="navbar-center">
		<h1 class="text-md md:text-xl font-semibold text-base-content">{title}</h1>
	</div>
</nav>
