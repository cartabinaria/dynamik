<script lang="ts">
	import { Carta, CartaEditor } from 'carta-md';
	import { emoji } from '@cartamd/plugin-emoji';
	import { code } from '@cartamd/plugin-code';
	import { math } from '@cartamd/plugin-math';
	import { onDestroy } from 'svelte';
	import { auth, isAuthenticated } from '$lib/stores/auth';

	import { ANSWERS_URL } from '$lib/const';

	const carta = new Carta({
		extensions: [emoji(), code(), math()],
		sanitizer: false
	});

	let body: string = '';
	let disabled: boolean = false;
	let mounted = true;

	// Check authentication
	$: user = isAuthenticated($auth) ? $auth.user : null;

	onDestroy(() => {
		mounted = false;
	});

	// Props for the original usage (Question.svelte)
	export let submit: ((body: string, parent?: number | null) => Promise<boolean>) | undefined =
		undefined;

	// Props for the new usage (Answer.svelte)
	export let closeCallback: (() => void) | undefined = undefined;
	export let unfinishedReply: string | undefined = undefined;
	export let questionId: any = undefined;
	export let sendAnswerCallback: (() => void) | undefined = undefined;
	export let parentAnswerId: number | undefined = undefined; // TODO: se lo assegno all'id di una risposta esistente posso fare risposte a cascata
	export let reloadAnswers: (() => Promise<void>) | undefined = undefined;
	export let onSubmitSuccess: ((newAnswerId: number) => Promise<void>) | undefined = undefined;

	// Check if this is a reply (has parent) or a new answer (no parent)
	$: isReply = parentAnswerId !== undefined;

	// Initialize body with unfinishedReply if provided
	$: if (unfinishedReply !== undefined && body === '') {
		body = unfinishedReply;
	}

	const handleSubmit = async () => {
		disabled = true;

		try {
			if (submit) {
				// Original usage (Question.svelte)
				const success = await submit(body, parentAnswerId || null);
				if (success) {
					body = '';
				}
			} else if (questionId && sendAnswerCallback) {
				// New usage (Answer.svelte) - reply to a specific answer
				const answer = {
					question: questionId.id,
					content: body,
					parent: parentAnswerId,
					anonymous: true
				};

				const req = await fetch(ANSWERS_URL, {
					headers: {
						'Content-Type': 'application/json'
					},
					body: JSON.stringify(answer),
					method: 'POST',
					credentials: 'include'
				});

				const res = await req.json();
				const success = 'id' in res;

				if (success) {
					// Call success callback with new answer ID before other operations
					if (onSubmitSuccess && 'id' in res) {
						await onSubmitSuccess(res.id);
					}

					// Reload answers first
					if (reloadAnswers) {
						await reloadAnswers();
					}

					// Delay clearing body to avoid carta-md race condition
					setTimeout(() => {
						if (mounted) {
							body = '';
						}
					}, 100);

					// Close the reply box
					if (sendAnswerCallback) {
						sendAnswerCallback();
					}
				}
			}
		} catch (error) {
			console.error('Error submitting reply:', error);
		} finally {
			if (mounted) {
				disabled = false;
			}
		}
	};

	const handleCancel = () => {
		if (closeCallback) {
			closeCallback();
		}
	};
</script>

<!-- Reply Box with conditional Timeline Design -->
<div class="flex gap-4 w-full mb-4">
	{#if isReply}
		<!-- Timeline Line (only for replies) -->
		<div class="relative flex flex-col items-center">
			<!-- Timeline connector from above -->
			<div class="w-0.5 h-4 bg-primary/30"></div>

			<!-- Timeline dot with Plus icon -->
			<div
				class="w-8 h-8 bg-accent/10 border-2 border-accent/30 rounded-full flex items-center justify-center flex-shrink-0"
			>
				<span class="icon-[solar--add-bold] text-accent/70 text-sm"></span>
			</div>
		</div>

		<!-- Reply Box Content -->
		<div class="flex-1 bg-base-200 backdrop-blur-sm rounded-lg p-4 min-w-0 mr-4">
			{#if user}
				<!-- Header -->
				<div class="flex items-center gap-3 mb-4">
					<div class="flex items-center gap-2 text-sm text-base-content/70">
						<span class="icon-[solar--chat-round-dots-bold] text-accent/70"></span>
						Reply to this answer
					</div>
				</div>

				<!-- Editor -->
				<div class="mb-4">
					<CartaEditor bind:value={body} mode="tabs" theme="github" {carta} />
				</div>

				<!-- Buttons -->
				<div class="flex justify-end gap-2">
					{#if closeCallback}
						<button class="btn btn-ghost btn-sm" on:click|preventDefault={handleCancel}>
							Cancel
						</button>
					{/if}
					<button class="btn btn-primary btn-sm" {disabled} on:click|preventDefault={handleSubmit}>
						Submit
					</button>
				</div>
			{:else}
				<div class="text-center text-base-content/60 py-4">
					<p>Please log in to write a reply</p>
				</div>
			{/if}
		</div>
	{:else}
		<!-- New Answer Box Content (no timeline) -->
		<div class="w-full bg-base-200/30 backdrop-blur-sm rounded-lg p-4">
			{#if user}
				<!-- Header -->
				<div class="flex items-center gap-3 mb-4">
					<div class="flex items-center gap-2 text-sm text-base-content/70">
						<span class="icon-[solar--lightbulb-bold] text-primary/70"></span>
						Share your answer
					</div>
				</div>

				<!-- Editor -->
				<div class="mb-4">
					<CartaEditor bind:value={body} mode="tabs" theme="github" {carta} />
				</div>

				<!-- Buttons -->
				<div class="flex justify-end gap-2">
					{#if closeCallback}
						<button class="btn btn-ghost btn-sm" on:click|preventDefault={handleCancel}>
							Cancel
						</button>
					{/if}
					<button class="btn btn-primary btn-sm" {disabled} on:click|preventDefault={handleSubmit}>
						Submit
					</button>
				</div>
			{:else}
				<div class="text-center text-base-content/60 py-4">
					<p>Please log in to write a reply</p>
				</div>
			{/if}
		</div>
	{/if}
</div>
