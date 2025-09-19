<!--
SPDX-FileCopyrightText: 2025 Alice Benatti <alice17bee@gmail.com>

SPDX-License-Identifier: AGPL-3.0-or-later
-->

<script lang="ts">
	import { onMount } from 'svelte';
	import { checkAuth, auth } from '$lib/stores/auth';
	import type { Proposal } from '$lib/polleg';
	import { ASSET_URL, PROPOSAL_URL } from '$lib/const';
	import PDFViewer from '$lib/components/polleg/PDFViewer.svelte';
	import Navbar from '$lib/components/Navbar.svelte';
	import ProposalApprove from '$lib/components/polleg/ProposalApprove.svelte';

	let proposals: Proposal[] = $state([]);
	let message = $state<{ type: 'error' | 'success'; text: string } | null>(null);

	onMount(async () => {
		await checkAuth(fetch);
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
	<Navbar title="PDF Proposal Approve"></Navbar>

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
							<input type="checkbox" />
							<div class="collapse-title font-semibold">
								<div class="flex justify-between">
									<p class="font-semibold">{`${p.document_path}`}</p>
									<ProposalApprove
										{p}
										onupdate={({ id }) => {
											updateProposals?.(id);
										}}
										document={true}
									></ProposalApprove>
								</div>
								<div class="text-xs text-base-content/50 mt-2 flex items-center gap-2">
									<p>Proposed by</p>
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
								<PDFViewer
									url={ASSET_URL(p.document_path)}
									questions={p.questions}
									proposal={true}
									{updateProposals}
								/>
							</div>
						</div>
					</div>
				</div>
			{/each}
		</div>
	{/if}
</div>
