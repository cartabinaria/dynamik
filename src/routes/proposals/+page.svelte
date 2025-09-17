<!-- 
SPDX-FileCopyrightText: 2025 Alice Benatti <alice17bee@gmail.com>

SPDX-License-Identifier: AGPL-3.0-or-later
-->

<script lang="ts">
	import { page } from '$app/stores';
	import { onMount } from 'svelte';
	import { checkAuth, auth } from '$lib/stores/auth';
	import type { Question } from '$lib/polleg';
	import { ASSET_URL, PROPOSAL_URL, PROPOSALS_URL } from '$lib/const';
	import LoginButton from '$lib/components/LoginButton.svelte';
	import PDFViewer from '$lib/components/polleg/PDFViewer.svelte';

	let proposals = $state([]) as Array<{
		id: any;
		questions: Question[];
		document_path: string;
	}>;
	let message = $state<{ type: 'error' | 'success'; text: string } | null>(null);
	let openedProposalId = $state(null);

	onMount(async () => {
		await checkAuth();
		if (!('user' in $auth && $auth.user?.role === 'admin')) {
			message = { type: 'error', text: 'Access denied: admin only' };
			return;
		}

		try {
			const res = await fetch(PROPOSAL_URL, { credentials: 'include' });
			if (!res.ok) throw new Error(`Failed to load proposals (${res.status})`);

			proposals = await res.json();
		} catch (e) {
			message = { type: 'error', text: (e as Error).message };
		}
	});

	function updateProposals(id: number) {
		proposals = proposals.filter((proposal) => proposal.id !== id);
	}
</script>

<svelte:head>
	<title>Moderation</title>
</svelte:head>

<div class="max-w-5xl p-4 mx-auto">
	<nav class="navbar flex bg-base-200 rounded-box shadow-xs px-5 mb-5">
		<div class="navbar-start flex items-center">
			<a href="/" class="btn btn-ghost btn-primary rounded-lg" title="Home" aria-label="Home">
				<span class="icon-[ic--round-home]"></span>
				Home
			</a>
			<button
				class="btn btn-ghost btn-primary rounded-lg"
				title="Indietro"
				aria-label="Indietro"
				onclick={() => history.back()}
			>
				<span class="icon-[akar-icons--arrow-back-thick-fill]"></span>
				Go back
			</button>
		</div>
		<div class="navbar-center">
			<h1 class="text-xl font-semibold text-base-content">PDF Proposal Approve</h1>
		</div>

		<div class="navbar-end">
			<LoginButton url={$page.url} />
		</div>
	</nav>
	{#if proposals.length === 0}
		<div class="card p-6 items-center">
			<span class="icon-[solar--sofa-bold-duotone] text-5xl"></span>
			<p class="text-center text-sm text-base-content/70">
				Looks like there are no proposals to approve right now, so just <i>polleg!</i>
			</p>
		</div>
	{:else}
		<div class="grid gap-3">
			{#each proposals as p (p.id)}
				<div class="relative">
					<div class="card bg-base-200 shadow-sm border border-base-300 p-4">
						<div class="collapse collapse-arrow bg-base-100 border border-base-300">
							<input
								type="radio"
								name="my-accordion-3"
								bind:group={openedProposalId}
								value={p.id}
							/>
							<div class="collapse-title font-semibold">
								<p class="font-semibold">{`Proposal ${p.document_path}`}</p>
								<div class="text-xs text-base-content/50 mt-2 flex items-center gap-2">
									<img
										class="w-6 h-6 rounded-full ring-1 ring-base-300/50 transition-all"
										src={p.questions[0].user_avatar_url}
										alt={p.questions[0].username + ' profile picture'}
										loading="lazy"
										referrerpolicy="no-referrer"
									/>
									<p>{p.questions[0].username}</p>
								</div>
							</div>
							<div class="collapse-content text-sm">
								{#if openedProposalId === p.id}
									<PDFViewer
										url={ASSET_URL(p.document_path)}
										questions={p.questions}
										proposal={true}
										{updateProposals}
									/>
								{/if}
							</div>
						</div>
					</div>
				</div>
			{/each}
		</div>
	{/if}
</div>
