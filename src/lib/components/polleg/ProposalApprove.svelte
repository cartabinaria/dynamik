<!--
SPDX-FileCopyrightText: 2025 Alice Benatti <alice17bee@gmail.com>

SPDX-License-Identifier: AGPL-3.0-or-later
-->

<script lang="ts" generics="K extends { id: number }">
	import { PROPOSALS_URL } from '$lib/const';
	import { toast } from '$lib/toast';
	import { SvelteMap } from 'svelte/reactivity';

	let loadingMap = $state(new Map<number, boolean>());

	type Props = {
		p: K;
		onupdate: ({ id, action }: { id: number; action: 'approve' | 'reject' }) => void;
	};
	let { p, onupdate }: Props = $props();

	async function approve(id: number) {
		setLoading(id, true);
		try {
			const res = await fetch(`${PROPOSALS_URL(id)}/approve`, {
				method: 'POST',
				credentials: 'include'
			});
			if (!res.ok) throw new Error('Failed to approve');
			toast.success(`Approved proposal ${id}`);

			// Notifica il genitore che la question è stata approvata
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

			// Notifica il genitore che la question è stata rifiutata
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

│ {#if p.id}
	<div class="fab fab-flower absolute right-6 bottom-6 z-[99] pointer-events-none mb-2">
		<div tabindex="0" role="button" class="btn btn-circle btn-primary">
			<span class="icon-[solar--menu-dots-bold] text-lg"></span>
		</div>

		<button class="fab-main-action btn btn-circle btn-base-100" aria-label="Menu">
			<span class="icon-[solar--menu-dots-bold] text-lg"></span>
		</button>

		<button
			class="btn btn-sm btn-circle btn-success z-50 absolute"
			onclick={() => approve(p.id)}
			disabled={loadingMap.get(p.id)}
		>
			{#if loadingMap.get(p.id)}<span class="loading loading-spinner text-primary"></span>{:else}
				<span class="icon-[ic--round-task-alt] text-lg"></span>{/if}
		</button>
		<button
			class="btn btn-sm btn-circle btn-error z-50 absolute"
			onclick={() => rejectProposal(p.id)}
			disabled={loadingMap.get(p.id)}
		>
			{#if loadingMap.get(p.id)}<span class="loading loading-spinner text-error"></span>{:else}<span
					class="icon-[solar--trash-bin-trash-bold] text-lg"
				></span>{/if}
		</button>
	</div>
{:else}
	<p class="font-semibold bg-error rounded-lg absolute right-6 bottom-6 z-[99] p-2 mb-2">
		This isn’t considered a proper question, so go ahead and create a new one for this PDF. Users
		won’t be able to use the Q&A here.
	</p>
{/if}
