<!--
SPDX-FileCopyrightText: 2025 Alice Benatti <alice17bee@gmail.com>

SPDX-License-Identifier: AGPL-3.0-or-later
-->

<script lang="ts" generics="K extends { id: number }">
	import { APPROVE_DOCUMENTS_URL, PROPOSALS_URL } from '$lib/const';
	import { toast } from '$lib/toast';
	import type { Proposal } from '$lib/polleg.svelte';
	import { SvelteMap } from 'svelte/reactivity';

	let loadingMap = $state(new Map<number, boolean>());

	type Props = {
		p: Proposal;
		document?: boolean;
		onupdate: ({ id, action }: { id: number; action: 'approve' | 'reject' }) => void;
	};
	let { p, document, onupdate }: Props = $props();

	async function approve(id: number) {
		setLoading(id, true);
		try {
			let res;
			if (document) {
				res = await fetch(`${APPROVE_DOCUMENTS_URL(id)}`, {
					method: 'POST',
					credentials: 'include'
				});
			} else {
				res = await fetch(`${PROPOSALS_URL(id)}/approve`, {
					method: 'POST',
					credentials: 'include'
				});
			}
			if (!res.ok) throw new Error('Failed to approve');
			toast.success(`Approved proposal ${id}`);

			// update parent
			onupdate({ id, action: 'approve' });
		} catch (e) {
			toast.error(`${(e as Error).message}`);
		} finally {
			setLoading(id, false);
		}
	}

	async function rejectProposal(id: number) {
		setLoading(id, true);
		try {
			const res = await fetch(PROPOSALS_URL(id), { method: 'DELETE', credentials: 'include' });
			if (!res.ok) throw new Error('Failed to reject');
			toast.success(`Rejected proposal ${id}`);

			// update parent
			onupdate({ id, action: 'reject' });
		} catch (e) {
			toast.error(`${(e as Error).message}`);
		} finally {
			setLoading(id, false);
		}
	}

	function setLoading(id: number, v: boolean) {
		loadingMap.set(id, v);
		loadingMap = new SvelteMap(loadingMap); // Force tick
	}
</script>

{#if p && p.id}
	<div
		class={`pointer-events-none mb-auto ${
			!document ? 'fab fab-flower absolute right-6 bottom-6 z-[99]' : 'flex gap-2'
		}`}
	>
		{#if !document}
			<div tabindex="0" role="button" class="btn btn-circle btn-primary">
				<span class="icon-[solar--menu-dots-bold] text-lg"></span>
			</div>

			<button class="fab-main-action btn btn-circle btn-base-100" aria-label="Menu">
				<span class="icon-[solar--menu-dots-bold] text-lg"></span>
			</button>
		{/if}

		{#each [{ type: 'success', icon: 'ic--round-task-alt', text: 'Approve all', action: approve }, { type: 'error', icon: 'solar--trash-bin-minimalistic-bold', text: 'Reject all', action: rejectProposal }] as btn}
			<button
				class={`btn btn-sm z-50 btn-${btn.type} pointer-events-auto ${
					document ? 'rounded-lg btn-outline' : 'btn-circle absolute'
				}`}
				onclick={(e) => {
					e.stopPropagation();
					btn.action(p.id);
				}}
				disabled={loadingMap.get(p.id)}
			>
				{#if loadingMap.get(p.id)}
					<span class="loading loading-spinner text-${btn.type === 'success' ? 'primary' : 'error'}"
					></span>
				{:else}
					<span class={`icon-[${btn.icon}] text-lg`}></span>
				{/if}

				{#if document}{btn.text}{/if}
			</button>
		{/each}
	</div>
{:else}
	<p class="font-semibold bg-error rounded-lg absolute right-6 bottom-6 z-[99] p-2 mb-2">
		This isn’t considered a proper question, so go ahead and create a new one for this PDF. Users
		won’t be able to use the Q&A here.
	</p>
{/if}
