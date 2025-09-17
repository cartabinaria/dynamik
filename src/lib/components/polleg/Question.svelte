<!-- 
SPDX-FileCopyrightText: 2024 Luca Tagliavini <luca@teapot.ovh>
SPDX-FileCopyrightText: 2025 Alice Benatti <alice17bee@gmail.com>
SPDX-FileCopyrightText: 2025 Samuele Musiani <samu@teapot.ovh>

SPDX-License-Identifier: AGPL-3.0-or-later
-->

<script lang="ts">
	import type { Question, Answer } from '$lib/polleg';
	import { QUESTION_URL, ANSWERS_URL } from '$lib/const';

	import AnswerComponent from '$lib/components/polleg/Answer.svelte';
	import ReplyBox from '$lib/components/polleg/ReplyBox.svelte';
	import { onMount } from 'svelte';

	let { question = $bindable(), onAnswerUpdate } = $props<{ question: Question; onAnswerUpdate?: () => Promise<void> | undefined }>();

	let expanded = false;
	let answerContainer: HTMLElement | undefined = $state();
	let loading = $state(true);
	let spinner: HTMLSpanElement | undefined = $state();
	let isDesktop = false;

	onMount(() => {
		const checkScreenSize = () => {
			isDesktop = window.innerWidth >= 768;
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
		let voteA = a.count || 0;
		let voteB = b.count || 0;

		if (voteA !== voteB) return voteB - voteA;

		const dateA = new Date(a.created_at || a.id);
		const dateB = new Date(b.created_at || b.id);
		return dateA.getTime() - dateB.getTime();
	};

	const load = async () => {
		const res = await fetch(QUESTION_URL(question.id), { credentials: 'include' });
		const data = await res.json();

		question.answers = (data.answers || []).sort(sortCriteria);
		loading = false;
	};

	const addAnswer = async (
		body: string,
		parent?: number | null,
		anonymous = false
	): Promise<boolean> => {
		const answer: any = { question: question.id, content: body, anonymous };
		if (parent) answer.parent = parent;

		const req = await fetch(ANSWERS_URL, {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify(answer),
			credentials: 'include'
		});
		const res = await req.json();
		const success = 'id' in res;

		if (success) {
			const newAnswerId = res.id;
			await load();
			if (onAnswerUpdate) await onAnswerUpdate();

			setTimeout(() => {
				const newAnswer = answerContainer?.querySelector(`[data-answer-id="${newAnswerId}"]`);
				if (newAnswer) {
					newAnswer.scrollIntoView({ behavior: 'smooth', block: 'center' });
					newAnswer.classList.add('animate-pulse');
					setTimeout(() => newAnswer.classList.remove('animate-pulse'), 2000);
				}
			}, 300);
		}
		return success;
	};

	$effect(() => {
		if (expanded) load();
	});
</script>

<div class="flex flex-col items-center pb-8 w-full">
	{#if loading}
		<span bind:this={spinner} class="loading loading-spinner loading-md my-4"></span>
	{:else}
		<div bind:this={answerContainer} class="w-full flex flex-col gap-2 md:gap-4 md:px-4" data-answers>
			{#if question.answers.length === 0}
				<p class="text-base-content/70 italic mb-4">No answers yet. Be the first to answer!</p>
			{/if}

			{#each question.answers as answer, index}
				<AnswerComponent
					{answer}
					{index}
					{question}
					data={{ answers: question.answers }}
					reloadAnswers={load}
					{onAnswerUpdate}
				/>
			{/each}
		</div>
	{/if}

	<div class="w-full py-2 md:p-4">
		<ReplyBox submit={addAnswer} />
	</div>
</div>
