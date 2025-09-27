<!--
SPDX-FileCopyrightText: 2024 geno <gabriele.genovese2@studio.unibo.it>
SPDX-FileCopyrightText: 2025 Alice Benatti <alice17bee@gmail.com>

SPDX-License-Identifier: AGPL-3.0-or-later
-->

<script lang="ts">
	let {
		setEditMode,
		isAdminAndMember,
		authenticated: isAuthenticated
	}: {
		setEditMode: (flag: boolean) => void;
		isAdminAndMember: boolean;
		authenticated?: boolean;
	} = $props();
</script>

<div class="flex justify-center mb-2">
	<div class="text-center">
		<p class="text-xl mb-8">
			{#if isAdminAndMember}
				This document isn't ready for interactive Q&A yet. <b>You can prepare it now!</b>
			{:else if isAuthenticated}
				This document isn't ready for interactive Q&A yet. <b>Help us by preparing it!</b>
			{:else}
				Sorry, but the document isn't ready for interactive Q&A yet. <b>Please check back soon!</b>
			{/if}
		</p>

		{#if isAdminAndMember}
			<button
				class="btn btn-outline btn-primary"
				onclick={(e) => {
					e.preventDefault();
					setEditMode(true);
				}}
			>
				Prepare PDF
			</button>
		{:else if isAuthenticated}
			<button
				class="btn btn-outline btn-primary"
				onclick={(e) => {
					e.preventDefault();
					setEditMode(true);
				}}
			>
				Propose PDF preparation
			</button>
		{:else}
			<p class="mb-4">Please login to propose PDF preparation.</p>
		{/if}
		<button
			class="btn btn-ghost"
			onclick={(e) => {
				e.preventDefault();
				history.back();
			}}
		>
			Go back
		</button>
	</div>
</div>
