<!-- SPDX-FileCopyrightText: 2025 Alice Benatti <alice17bee@gmail.com> SPDX-License-Identifier: AGPL-3.0-or-later -->
<script lang="ts">
	import { REPORT_URL } from '$lib/const';
	import { toast } from '$lib/toast';
	import { onMount } from 'svelte';

	let { id }: { id: number } = $props();
	let selectedReason: string = $state('');
	let reported: boolean = $state(false);

	onMount(){
		// Check if the answer is already reported
		fetch(REPORT_URL(id), {
			method: 'GET',
			credentials: 'include'
		})
			.then((res) => res.json())
			.then((data) => {
				if (data.reported) {
					reported = true;
				}
			})
			.catch((error) => {
				console.error('Error checking report status:', error);
			});
	}

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
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ cause: cause }),
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

{#if reported}
	<p class="text-sm italic text-warning/80">This answer is already reported</p>
{/if}
<div class="dropdown dropdown-end">
	<label
		tabindex="0"
		class="btn btn-ghost btn-square btn-xs text-warning hover:btn-warning opacity-60 hover:opacity-100 hover:text-base-100"
	>
		<span class="icon-[solar--shield-warning-bold] text-xl"></span>
	</label>
	<ul
		tabindex="0"
		class="dropdown-content menu bg-base-100 rounded-box w-52 md:w-70 p-2 shadow-sm z-[100]"
	>
		<p class="font-semibold mb-2">Report this answer</p>
		<p class="mb-2 text-sm">
			The moderators can take action on this report and will review it as soon as possible.
		</p>
		{#each reportOptions as option}
			<li>
				<label class="flex items-center gap-2">
					<input
						type="radio"
						name="report-reason"
						class="radio"
						value={option}
						bind:group={selectedReason}
					/>
					{option}
				</label>
			</li>
		{/each}
		<li class="mt-2">
			<button
				class="btn btn-primary w-full"
				onclick={() => reportAnswer(selectedReason)}
				disabled={!selectedReason}
				title="Report this answer"
				aria-label="Report this answer"
			>
				Report Message
			</button>
		</li>
	</ul>
</div>
