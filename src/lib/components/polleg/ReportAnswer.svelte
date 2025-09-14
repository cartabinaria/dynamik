<!-- 
SPDX-FileCopyrightText: 2025 Alice Benatti <alice17bee@gmail.com>

SPDX-License-Identifier: AGPL-3.0-or-later
 -->

<script lang="ts">
	import { REPORT_URL } from '$lib/const';
	import { toast } from '$lib/toast';

	let { id }: { id: number } = $props();

	let selectedReason: string = $state('');

	const reportOptions = [
		'I don’t like it',
		'Bullying or unwanted contact',
		'Spam or advertising',
		'Violence, hate, or exploitation',
		'Nudity or sexual acts',
		'Fake news',
		'Other'
	];

	async function reportAnswer(cause: string) {
		try {
			const res = await fetch(REPORT_URL(id), {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify({
					cause: cause
				}),
				credentials: 'include'
			});
			if (res.status === 200) {
				toast.success('Answer reported. Thank you for your feedback.');
			} else {
				toast.error('Error reporting answer. Please try again later.');
			}
		} catch (error) {
			console.error('Error reporting answer:', error);
		}
	}
</script>

<button
	class="btn btn-ghost btn-square btn-xs text-warning hover:btn-warning opacity-60 hover:opacity-100 hover:text-base-100"
	title="Report this reply to admin"
	aria-label="Report this reply to admin"
	popovertarget="report-menu"
>
	<span class="icon-[solar--shield-warning-bold] text-xl"></span>
</button>

<div id="report-menu" class="menu bg-base-100 rounded-box z-1 w-52 p-2 shadow-sm">
	<p class="font-semibold mb-2">Report this answer</p>
	<p>The moderators can take action on this report and will review it as soon as possible.</p>
	<ul>
		{#each reportOptions as option}
			<li>
				<input
					type="radio"
					name="report-reason"
					class="radio"
					value={option}
					bind:group={selectedReason}
				/>
				{option}
			</li>
		{/each}
	</ul>
	<button
		class="btn btn-primary"
		onclick={() => reportAnswer(selectedReason)}
		disabled={!selectedReason}
	>
		Report
	</button>
</div>
