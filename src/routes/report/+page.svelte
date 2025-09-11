<script lang="ts">
	import { page } from '$app/stores';
	import { getCartaConfig } from '$lib/carta-config';
	import LoginButton from '$lib/components/LoginButton.svelte';
	import { ANSWERS_REPLIES_URL, BAN_URL, REPORTS_URL } from '$lib/const';
	import { formatDate } from '$lib/date';
	import type { Report } from '$lib/polleg';
	import { auth, isAuthenticated } from '$lib/stores/auth';
	import { Carta, Markdown } from 'carta-md';
	import { onMount } from 'svelte';

	let reports: Report[] = $state([]);
	let banned = $state<{ username: string; user_avatar_url: string; banned_at: string }[]>([]);
	const carta = new Carta(getCartaConfig());

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
				const resban = await fetch(BAN_URL, { credentials: 'include' });
				if (resban.ok) {
					banned = await resban.json();
				} else {
					console.error('Failed to fetch banned users:', resban.statusText);
				}
				console.log('Fetched reports:', reports);
				console.log('Fetched banned users:', banned);
			} catch (error) {
				console.error('Error fetching reports:', error);
			}
		}
	});

	async function getAnswerContent(answerId: number) {
		const res = await fetch(ANSWERS_REPLIES_URL(answerId), { credentials: 'include' });
		if (res.ok) {
			const answer = await res.json();
			console.log('Fetched answer:', answer);
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
				} else {
					console.error('Failed to fetch banned users:', resban.statusText);
				}
			}
		} else {
			console.error('Failed to ban/unban user:', res.statusText);
		}
	}
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
			<h1 class="text-xl font-semibold text-base-content">Report</h1>
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
					<th>Cause</th>
					<th>AnswerID</th>
					<th>Answer</th>
					<th>Report at</th>
				</tr>
			</thead>
			<tbody>
				{#each reports as report}
					<tr>
						<td>
							<div class="flex items-center gap-3">
								<div class="avatar">
									<div class="mask mask-squircle h-6 w-6">
										<img src={report.user_avatar_url} alt="Avatar of {report.username}" />
									</div>
								</div>
								<div>
									<div class="font-bold">{report.username}</div>
								</div>
							</div>
						</td>
						<td>
							{report.cause}
						</td>
						<td
							>{report.answer_id}
							<!-- TODO: answer url -->
						</td>
						<td>
							<div class="leading-normal mb-4">
								<!-- <Markdown {carta} value={report.answer.content} /> -->
								<!-- FIXME fa schifo carta-->
							</div>
						</td>
						<td>{formatDate(report.created_at)}</td>
						<th>
							<button
								class="btn btn-xs btn-error"
								onclick={() => banUser(report.answer.user, true)}
								title="Ban user"
								aria-label="Ban user"
							>
								<span class="icon-[akar-icons--trash]"></span>
								BAN {report.answer?.user}
							</button>
						</th>
					</tr>
				{/each}
			</tbody>
		</table>

		<table class="table">
			<!-- head -->
			<thead>
				<tr>
					<th>Banned users</th>
				</tr>
			</thead>
			<tbody>
				{#each banned as ban}
					<tr>
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
						</th>
					</tr>
				{/each}
			</tbody>
		</table>
	</div>
</div>
