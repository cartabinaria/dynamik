<!--
SPDX-FileCopyrightText: 2025 Alice Benatti <alice17bee@gmail.com>

SPDX-License-Identifier: AGPL-3.0-or-later
-->

<script lang="ts">
	import Navbar from '$lib/components/Navbar.svelte';
	import { LOGS_URL } from '$lib/const';
	import type { Logs } from '$lib/polleg';
	import { auth, isAuthenticated } from '$lib/stores/auth';
	import { onMount } from 'svelte';

	let { data }: PageProps = $props();
	let { logs } = $derived(data);
</script>

<div class="max-w-5xl p-4 mx-auto">
	<Navbar title="Logs"></Navbar>

	<div class="overflow-x-auto overflow-y-auto">
		<table class="table">
			<!-- head -->
			<thead>
				<tr>
					<th>User</th>
					<th>Action</th>
					<th>Timestamp</th>
					<th>Item ID</th>
					<th>Item Type</th>
				</tr>
			</thead>
			<tbody>
				{#each logs as log (log.item_id + log.timestamp)}
					<tr>
						<td>
							<div class="flex items-center gap-3">
								<div class="avatar">
									<div class="mask mask-squircle h-6 w-6">
										{#if log.username === 'system'}
											<span class="icon-[mdi--robot] text-2xl text-accent"></span>
										{:else}
											<img src={log.user_avatar_url} alt="Avatar of {log.username}" />
										{/if}
									</div>
								</div>
								<div>
									<div class="font-bold">{log.username}</div>
								</div>
							</div>
						</td>
						<td>
							{log.action}
						</td>
						<td>{log.timestamp}</td>
						<td>{log.item_id}</td>
						<td>{log.item_type}</td>
					</tr>
				{/each}
			</tbody>
		</table>
	</div>
</div>
