<!-- 
SPDX-FileCopyrightText: 2025 Alice Benatti <alice17bee@gmail.com>

SPDX-License-Identifier: AGPL-3.0-or-later
 -->

<script lang="ts">
	import { REPORT_URL } from '$lib/const';

	let { id }: { id: number } = $props();
	const reportOptions = [
		'I don’t like it',
		'Bullying or unwanted contact',
		'Spam or advertising',
		'Violence, hate, or exploitation',
		'Nudity or sexual acts',
		'Fake news',
		'Other'
	];

	function reportAnswer(cause: string) {
		const res = fetch(REPORT_URL(id), {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json'
			},
			body: JSON.stringify({
				cause: cause
			}),
			credentials: 'include'
		});
	}
</script>

<div class="dropdown dropdown-end">
	<div
		tabindex="0"
		role="button"
		class="btn btn-ghost btn-square btn-xs text-warning hover:btn-warning opacity-60 hover:opacity-100 hover:text-base-100"
		title="Report this reply to admin"
		aria-label="Report this reply to admin"
	>
		<span class="icon-[solar--shield-warning-bold] text-xl"></span>
	</div>
	<ul tabindex="0" class="dropdown-content menu bg-base-100 rounded-box z-1 w-52 p-2 shadow-sm">
		{#each reportOptions as option}
			<li>
				<a on:click={() => reportAnswer(option)}>{option}</a>
			</li>
		{/each}
	</ul>
</div>
