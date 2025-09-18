<!--
SPDX-FileCopyrightText: 2025 Alice Benatti <alice17bee@gmail.com>

SPDX-License-Identifier: AGPL-3.0-or-later
-->

<script lang="ts">
	import LoginButton from '$lib/components/LoginButton.svelte';
	import type { PageProps } from './$types';
	import { resolve } from '$app/paths';
	import { page } from '$app/state';

	let { data }: PageProps = $props();
	let { logs } = $derived(data);
</script>

<div class="max-w-5xl p-4 mx-auto">
	<nav class="navbar flex bg-base-200 rounded-box shadow-xs px-5 mb-5">
		<div class="navbar-start flex items-center">
			<a
				href={resolve('/')}
				class="btn btn-ghost btn-primary rounded-lg"
				title="Home"
				aria-label="Home"
			>
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
		<div class="navbar-cener">
			<h1 class="text-xl font-semibold text-base-content">Logs</h1>
		</div>

		<div class="navbar-end">
			<LoginButton url={page.url} />
		</div>
	</nav>
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
