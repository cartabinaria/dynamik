<!--
SPDX-FileCopyrightText: 2023 - 2025 Eyad Issa <eyadlorenzo@gmail.com>

SPDX-License-Identifier: AGPL-3.0-or-later
-->

<script lang="ts">
	import { page } from '$app/state';
	import Navbar from '$lib/components/Navbar.svelte';

	let { error, status } = $derived(page);

	const getErrorIcon = () => {
		if (!error) return 'icon-[mdi--alert-circle-outline]';

		if (status === 404) return 'icon-[mdi--file-alert-outline]';
		if (status >= 500) return 'icon-[solar--danger-circle-bold]';

		return 'icon-[mdi--emoticon-sad-outline]';
	};
</script>

<Navbar title=""></Navbar>

<div class="flex flex-col justify-center items-center h-[90vh] m-auto px-4 text-center gap-6">
	<!-- Icona -->
	<span class={`text-[8rem] md:text-[9rem] animate- ${getErrorIcon()}`}></span>

	<!-- Messaggio -->
	<div class="max-w-lg">
		<p class="text-2xl md:text-3xl font-bold text-base-content mb-2">
			{status} — {error ? error.message : 'Unknown error!'}
		</p>
		<p class="text-base md:text-lg text-base-content/70">Oops! Something went wrong.</p>
	</div>

	<!-- Pulsanti -->
	<div class="flex flex-col md:flex-row gap-3 mt-6">
		<button
			class="btn btn-primary flex items-center justify-center gap-2"
			onclick={() => history.back()}
		>
			<span class="icon-[mdi--arrow-left] text-lg"></span>
			Go Back
		</button>
	</div>
</div>
