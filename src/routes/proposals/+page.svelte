<!--
SPDX-FileCopyrightText: 2025 Alice Benatti <alice17bee@gmail.com>

SPDX-License-Identifier: AGPL-3.0-or-later
-->

<script lang="ts">
	import { ASSET_URL } from '$lib/const';
	import PDFViewer from '$lib/components/polleg/PDFViewer.svelte';
	import Navbar from '$lib/components/Navbar.svelte';
	import ProposalApprove from '$lib/components/polleg/ProposalApprove.svelte';
	import type { PageProps } from './$types';
	import { invalidateAll } from '$app/navigation';

	let { data }: PageProps = $props();
	let { proposals } = $derived(data);
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
									<ProposalApprove {p} onupdate={() => invalidateAll()} document={true}
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
									updateProposals={() => invalidateAll()}
								/>
							</div>
						</div>
					</div>
				</div>
			{/each}
		</div>
	{/if}
</div>
