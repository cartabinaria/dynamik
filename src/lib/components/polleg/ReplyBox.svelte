<script lang="ts">
	import { Carta, CartaEditor } from 'carta-md';
	import { emoji } from '@cartamd/plugin-emoji';
	import { code } from '@cartamd/plugin-code';
	import { math } from '@cartamd/plugin-math';
	import { onDestroy } from 'svelte';

	import { ANSWERS_URL } from '$lib/const';

	const carta = new Carta({
		extensions: [emoji(), code(), math()],
		sanitizer: false
	});

	let body: string = '';
	let disabled: boolean = false;
	let mounted = true;
	
	onDestroy(() => {
		mounted = false;
	});
	
	// Props for the original usage (Question.svelte)
	export let submit: ((body: string, parent?: number | null) => Promise<boolean>) | undefined = undefined;
	
	// Props for the new usage (Answer.svelte)
	export let closeCallback: (() => void) | undefined = undefined;
	export let unfinishedReply: string | undefined = undefined;
	export let questionId: any = undefined;
	export let sendAnswerCallback: (() => void) | undefined = undefined;
	export let parentAnswerId: number | undefined = undefined;
	export let reloadAnswers: (() => Promise<void>) | undefined = undefined;

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
					parent: parentAnswerId
				};

				const req = await fetch(ANSWERS_URL, {
					headers: {
						'Content-Type': 'application/json'
					},
					body: JSON.stringify(answer),
					method: 'PUT',
					credentials: 'include'
				});

				const res = await req.json();
				const success = 'id' in res;
				
				if (success) {
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

<div class="rounded-xl max-w-4xl w-full flex flex-col items-center justify-center mb-4">
	<!-- TODO: risposta anonima -->
	<div class="w-full">
		<CartaEditor bind:value={body} mode="tabs" theme="github" {carta} />
	</div>
	<div class="flex w-full justify-end py-3 gap-2">
		{#if closeCallback}
			<button 
				class="btn btn-ghost btn-sm" 
				on:click|preventDefault={handleCancel}
			> 
				Cancel 
			</button>
		{/if}
		<button 
			class="btn btn-primary btn-sm" 
			{disabled}
			on:click|preventDefault={handleSubmit}
		> 
			Submit 
		</button>
	</div>
</div>
