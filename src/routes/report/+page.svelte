<!-- 
SPDX-FileCopyrightText: 2025 Alice Benatti <alice17bee@gmail.com>

SPDX-License-Identifier: AGPL-3.0-or-later
-->

<script lang="ts">
	import { page } from '$app/stores';
	import { carta } from '$lib/carta-config';
	import LoginButton from '$lib/components/LoginButton.svelte';
	import Navbar from '$lib/components/Navbar.svelte';
	import { ANSWERS_REPLIES_URL, BAN_URL, REPORTS_URL } from '$lib/const';
	import { formatDate } from '$lib/date';
	import type { Report } from '$lib/polleg';
	import { auth, isAuthenticated } from '$lib/stores/auth';
	import { toast } from '$lib/toast';
	import { Markdown } from 'carta-md';
	import { onMount } from 'svelte';

	let reports: Report[] = $state([]);
	let banned = $state<{ username: string; user_avatar_url: string; banned_at: string }[]>([]);

	onMount(async () => {
		if (isAuthenticated($auth)) {
			try {
				const res = await fetch(REPORTS_URL, { credentials: 'include' });
				if (res.ok) {
					reports = await res.json();
				} else {
					console.error('Failed to fetch reports:', res.statusText);
				}
				// Fetch reply contents for each report
				for (const report of reports) {
					report.answer = await getAnswerContent(report.answer_id);
				}
				reports = [...reports];
				const resban = await fetch(BAN_URL, { credentials: 'include' });
				if (resban.ok) {
					banned = await resban.json();
				} else {
					console.error('Failed to fetch banned users:', resban.statusText);
				}
			} catch (error) {
				console.error('Error fetching reports:', error);
			}
		}
	});

	async function getAnswerContent(answerId: number) {
		const res = await fetch(ANSWERS_REPLIES_URL(answerId), { credentials: 'include' });
		if (res.ok) {
			const answer = await res.json();
			return answer;
		} else {
			console.error('Failed to fetch answers:', res.statusText);
			return 'Error fetching answer';
		}
	}

	async function banUser(username: string, banmode: boolean) {
		const res = await fetch(BAN_URL, {
			method: 'POST',
			credentials: 'include',
			body: JSON.stringify({ username, ban: banmode })
		});
		if (res.ok) {
			if (!banmode) {
				banned = banned.filter((ban) => ban.username !== username);
			} else {
				// Refetch banned users
				const resban = await fetch(BAN_URL, { credentials: 'include' });
				if (resban.ok) {
					banned = await resban.json();
					toast.success(`${username} has been banned.`);
				} else {
					console.error('Failed to fetch banned users:', resban.statusText);
				}
			}
		} else {
			console.error('Failed to ban/unban user:', res.statusText);
		}
	}

	async function removeReport(id: number) {
		try {
			const res = await fetch(REPORTS_URL, {
				method: 'DELETE',
				credentials: 'include',
				body: JSON.stringify({ id })
			});
			if (res.ok) {
				reports = reports.filter((report) => report.id !== id);
				toast.success('Report removed.');
			} else {
				console.error('Failed to remove report:', res.statusText);
			}
		} catch (error) {
			console.error('Error removing report:', error);
		}
	}
</script>

<div class="max-w-5xl p-4 mx-auto">
	<Navbar title="Answers Moderation"></Navbar>
</div>

<div class="overflow-x-auto overflow-y-auto">
	<div class="grid grid-cols-1 lg:grid-cols-3 gap-2">
		<div class="card bg-base-100 shadow-xl col-span-2">
			<div class="card-body py-0 md:pr-0">
				<h2 class="card-title">Reports</h2>
				{#each reports as report}
					<div class="collapse collapse-arrow border border-base-300 bg-base-100 rounded-box">
						<input type="checkbox" />
						<div
							class="collapse-title text-md font-medium flex flex-col md:flex-row md:items-center gap-2"
						>
							<div class="flex flex-col">
								<div class="flex items-center gap-3 min-w-max">
									<div class="avatar">
										<div class="mask mask-squircle h-6 w-6">
											<img src={report.user_avatar_url} alt="Avatar of {report.username}" />
										</div>
									</div>
									<div>
										<div class="font-bold">{report.username}</div>
									</div>
								</div>
								<span class="badge badge-ghost badge-sm">
									{formatDate(report.created_at)}
								</span>
							</div>
							<p>Reported: <b>{report.answer?.user}</b>'s answer #{report.answer_id}</p>
						</div>
						<div class="collapse-content flex flex-col md:flex-row justify-around gap-1">
							<div class="flex items-start w-max">
								<div class="flex flex-col gap-2 w-max">
									Report reason:
									<p class="badge">
										{report.cause}
									</p>
									<div class="flex w-max justify-between gap-1">
										<button
											class="btn btn-warning btn-xs"
											onclick={() => banUser(report.answer.user, true)}
											title="Ban answer author"
											aria-label="Ban answer author"
										>
											BAN {report.answer?.user}
										</button>
										<button
											class="btn btn-error btn-xs btn-outline"
											onclick={() => removeReport(report.id)}
											title="Remove report"
											aria-label="Remove report"
										>
											<span class="icon-[solar--trash-bin-minimalistic-bold] text-lg"></span>
										</button>
									</div>
								</div>
							</div>
							<div class="prose card bg-base-200 p-4 rounded-lg">
								{#key report.answer?.content}
									<Markdown {carta} value={report.answer?.content} />
								{/key}
							</div>
						</div>
					</div>
				{/each}
			</div>
		</div>

		<div class="card bg-base-100 shadow-xl">
			<div class="card-body py-0">
				<h2 class="card-title">Banned Users</h2>
				{#if banned.length === 0}
					<p class="text-sm text-base-content/70">No users are currently banned.</p>
				{/if}
				<table class="table">
					<tbody>
						{#each banned as ban}
							<tr>
								<!-- TODO: additiona th for checkbox for mutiple action like remove -->
								<td>
									<div class="flex items-center gap-3">
										<div class="avatar">
											<div class="mask mask-squircle h-6 w-6">
												<img src={ban.user_avatar_url} alt="Avatar of {ban.username}" />
											</div>
										</div>
										<div>
											<div class="font-bold">{ban.username}</div>
										</div>
									</div>
								</td>
								<td>{formatDate(ban.banned_at)}</td>
								<th>
									<button
										class="btn btn-ghost btn-xs btn-error"
										onclick={() => banUser(ban.username, false)}
									>
										<span class="icon-[akar-icons--trash]"></span>
									</button>
									<!-- TODO: btn remove report -->
								</th>
							</tr>
						{/each}
					</tbody>
				</table>
			</div>
		</div>
	</div>
</div>
