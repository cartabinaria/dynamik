<!-- SPDX-FileCopyrightText: 2024 geno <gabriele.genovese2@studio.unibo.it>
SPDX-FileCopyrightText: 2024 Luca Tagliavini <luca@teapot.ovh>
SPDX-FileCopyrightText: 2025 Alice Benatti <alice17bee@gmail.com>
SPDX-FileCopyrightText: 2025 Samuele Musiani <samu@teapot.ovh>
SPDX-License-Identifier: AGPL-3.0-or-later -->

<script lang="ts">
	import { MarkdownEditor } from 'carta-md';
	import { onDestroy } from 'svelte';
	import { auth, isAuthenticated } from '$lib/stores/auth';
	import { ANSWERS_URL } from '$lib/const';
	import { carta } from '$lib/carta-config';

	// props
	let {
		submit,
		closeCallback,
		unfinishedReply,
		questionId,
		sendAnswerCallback,
		parentAnswerId,
		reloadAnswers,
		onSubmitSuccess
	}: {
		submit?: (body: string, parent?: number | null, anonymous?: boolean) => Promise<boolean>;
		closeCallback?: () => void;
		unfinishedReply?: string;
		questionId?: any;
		sendAnswerCallback?: () => void;
		parentAnswerId?: number;
		reloadAnswers?: () => Promise<void>;
		onSubmitSuccess?: (newAnswerId: number) => Promise<void>;
	} = $props();

	// state
	let body = $state(unfinishedReply ?? '');
	let disabled = $state(false);
	let isAnonymous = $state(false);
	let mounted = true;

	// derived
	let user = $derived(() => (isAuthenticated($auth) ? $auth.user : null));
	let isReply = $derived(() => parentAnswerId !== undefined);

	onDestroy(() => {
		mounted = false;
	});

	async function handleSubmit() {
		disabled = true;
		try {
			if (submit) {
				const success = await submit(body, parentAnswerId || null, isAnonymous);
				if (success) body = '';
			} else if (questionId && sendAnswerCallback) {
				const answer = {
					question: questionId.id,
					content: body,
					parent: parentAnswerId,
					anonymous: isAnonymous
				};

				const req = await fetch(ANSWERS_URL, {
					headers: { 'Content-Type': 'application/json' },
					body: JSON.stringify(answer),
					method: 'POST',
					credentials: 'include'
				});

				const res = await req.json();
				if ('id' in res) {
					if (onSubmitSuccess) await onSubmitSuccess(res.id);
					if (reloadAnswers) await reloadAnswers();

					setTimeout(() => {
						if (mounted) body = '';
					}, 100);
					sendAnswerCallback?.();
				}
			}
		} catch (err) {
			console.error('Error submitting reply:', err);
		} finally {
			if (mounted) disabled = false;
		}
	}
</script>

<div class="flex gap-2 md:gap-4 w-full mb-4">
	{#if isReply()}
		<!-- timeline for replies -->
		<div class="relative flex flex-col items-center">
			<div class="w-0.5 h-4 bg-primary/30"></div>
			<div
				class="w-8 h-8 text-accent/50 border-2 border-accent/30 rounded-full flex items-center justify-center flex-shrink-0 icon-[solar--add-circle-line-duotone]"
			></div>
		</div>
	{/if}

	<!-- box -->
	<div class="flex-1 bg-base-200/30 rounded-lg p-4 w-full">
		{#if user()}
			<!-- header -->
			<div class="flex items-center justify-between mb-4">
				<div class="flex items-center gap-2 text-sm text-base-content/70">
					<span
						class={isReply()
							? 'icon-[solar--chat-round-dots-bold] text-accent/70'
							: 'icon-[solar--lightbulb-bold] text-primary/70'}
					></span>
					{isReply() ? 'Replying to this answer' : 'Share your answer'}
				</div>
				<label class="label cursor-pointer gap-2">
					<input
						type="checkbox"
						bind:checked={isAnonymous}
						class="toggle toggle-sm toggle-primary"
					/>
					<div
						class="text-sm hover:text-primary flex items-center gap-2 {isAnonymous
							? 'text-primary'
							: ''}"
					>
						<span class="icon-[solar--incognito-bold] opacity-70"></span>
						Post anonymously
					</div>
				</label>
			</div>

			<!-- editor -->
			<MarkdownEditor bind:value={body} mode="tabs" theme="github" {carta} />

			<!-- buttons -->
			<div class="flex justify-end gap-2">
				{#if closeCallback}
					<button
						class="btn btn-ghost btn-sm"
						onclick={(e) => {
							e.preventDefault();
							closeCallback();
						}}
					>
						Cancel
					</button>
				{/if}

				<button
					class="btn btn-primary btn-sm"
					{disabled}
					onclick={(e) => {
						e.preventDefault();
						handleSubmit();
					}}
				>
					Submit
				</button>
			</div>
		{:else}
			<div class="text-center text-base-content/60 py-4">
				<p>Please log in to {isReply() ? 'write a reply' : 'write an answer'}</p>
			</div>
		{/if}
	</div>
</div>
