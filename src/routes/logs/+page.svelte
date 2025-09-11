<script lang="ts">
	import { page } from '$app/stores';
	import LoginButton from '$lib/components/LoginButton.svelte';
	import { LOGS_URL } from '$lib/const';
	import type { Logs } from '$lib/polleg';
	import { auth, isAuthenticated } from '$lib/stores/auth';
	import { onMount } from 'svelte';

	let logs: Logs[] = [];

	onMount(async () => {
		if (isAuthenticated($auth)) {
			try {
				const res = await fetch(LOGS_URL, { credentials: 'include' });
				if (res.ok) {
					logs = await res.json();
				} else {
					console.error('Failed to fetch logs:', res.statusText);
				}
			} catch (error) {
				console.error('Error fetching logs:', error);
			}
		}
	});
</script>

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
		<div class="navbar-cener">
			<h1 class="text-xl font-semibold text-base-content">Logs</h1>
		</div>

		<div class="navbar-end">
			<LoginButton url={$page.url} />
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
				{#each logs as log}
					<tr>
						<td>
							<div class="flex items-center gap-3">
								<div class="avatar">
									<div class="mask mask-squircle h-6 w-6">
										<img src={log.user_avatar_url} alt="Avatar of {log.username}" />
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
