<!--
SPDX-FileCopyrightText: 2023 - 2025 Eyad Issa <eyadlorenzo@gmail.com>

SPDX-License-Identifier: AGPL-3.0-or-later
-->

<script lang="ts">
	import { page } from '$app/state';

	let { error, status } = $derived(page);
</script>

<div class="flex justify-center h-screen items-center">
	<div class="text-center">
		<h1 class="text-5xl mb-6 font-mono">{status}</h1>

		<p class="text-xl font-mono text-base-content">
			{#if error == null}
				Unknown error!
			{:else}
				{error.message}
			{/if}
		</p>

		<button
			class="btn btn-ghost mt-10"
			onclick={(e) => {
				e.preventDefault();
				history.back();
			}}
		>
			Go back to previous page
		</button>
	</div>
</div>
