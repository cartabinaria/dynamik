<script lang="ts">
	import type { Question, Answer } from '$lib/polleg';
	import { QUESTION_URL, ANSWERS_URL } from '$lib/const';

	import AnswerComponent from '$lib/components/polleg/Answer.svelte';

	import ReplyBox from '$lib/components/polleg/ReplyBox.svelte';
	import { onMount } from 'svelte';

	export let question: Question;
	export let onAnswerUpdate: (() => Promise<void>) | undefined = undefined;

	let expanded: boolean = false;
	let answerContainer: HTMLElement;
	let loading: boolean = true;
	let spinner: HTMLSpanElement;
	let isDesktop: boolean = false;

	// Check if we're on desktop (md breakpoint and up)
	onMount(() => {
		const checkScreenSize = () => {
			isDesktop = window.innerWidth >= 768; // md breakpoint
			if (isDesktop && !expanded) {
				expanded = true;
				loading = true;
			}
		};

		checkScreenSize();
		window.addEventListener('resize', checkScreenSize);

		return () => window.removeEventListener('resize', checkScreenSize);
	});

	const sortCriteria = (a: Answer, b: Answer) => {
		// Primary sort: by vote count (highest first)
		let voteA: number = a.count || 0;
		let voteB: number = b.count || 0;

		if (voteA > voteB) {
			return -1; // a comes first
		}
		if (voteA < voteB) {
			return 1; // b comes first
		}

		// Secondary sort: by creation time (oldest first for tie-breaking)
		const dateA = new Date(a.created_at || a.id);
		const dateB = new Date(b.created_at || b.id);
		return dateA.getTime() - dateB.getTime();
	};

	const load = async () => {
		if (!expanded) return;

		const res = await fetch(QUESTION_URL(question.id));
		const data = await res.json();

		if (!data.answers) data.answers = [];

		question.answers = data.answers.sort(sortCriteria);
		loading = false;
	};

	const addAnswer = async (body: string, parent?: number | null, anonymous: boolean = false): Promise<boolean> => {
		let answer: any = { question: question.id, content: body, anonymous: anonymous };
		if (parent) answer.parent = parent;

		let req = await fetch(ANSWERS_URL, {
			headers: {
				'Content-Type': 'application/json'
			},
			body: JSON.stringify(answer),
			method: 'POST',
			credentials: 'include'
		});

		let res = await req.json();
		const success = 'id' in res; // An ID is provided when a new answer is inserted successfully
		if (success) {
			const newAnswerId = res.id;

			await load();
			// Call external callback to update parent component
			if (onAnswerUpdate) {
				await onAnswerUpdate();
			}

			// Scroll to the new answer with smooth animation
			setTimeout(() => {
				if (answerContainer && newAnswerId) {
					const newAnswer = answerContainer.querySelector(`[data-answer-id="${newAnswerId}"]`);
					if (newAnswer) {
						newAnswer.scrollIntoView({
							behavior: 'smooth',
							block: 'center'
						});

						// Add a brief highlight animation
						newAnswer.classList.add('animate-pulse');
						setTimeout(() => {
							newAnswer.classList.remove('animate-pulse');
						}, 2000);
					}
				}
			}, 300);
		}
		return success;
	};

	const deleteAnswer = async (id: number) => {
		// This function will be handled by the Answer component itself
		// We just need to provide it for the interface
	};

	$: (expanded, load());
</script>

<div class="flex items-center flex-col pb-8">
	{#if expanded}
		{#if loading}
			<span bind:this={spinner} class="loading loading-spinner loading-md my-4"></span>
		{:else}
			<div bind:this={answerContainer}>
				{#each question.answers as answer, index}
					<AnswerComponent
						{answer}
						{index}
						{question}
						removeAnswer={deleteAnswer}
						data={{ answers: question.answers }}
						reloadAnswers={load}
						{onAnswerUpdate}
					/>
				{/each}
			</div>
		{/if}
		<ReplyBox submit={addAnswer} />
	{/if}
	<button
		class="btn btn-primary md:hidden"
		on:click|preventDefault={() => {
			expanded = !expanded;
			loading = true;
		}}
	>
		{!expanded ? 'Show answers' : 'Hide answers'}
	</button>
</div>
