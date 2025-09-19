<!--
SPDX-FileCopyrightText: 2025 Alice Benatti <alice17bee@gmail.com>
SPDX-FileCopyrightText: 2024 Luca Tagliavini <luca@teapot.ovh>
SPDX-FileCopyrightText: 2025 Samuele Musiani <samu@teapot.ovh>

SPDX-License-Identifier: AGPL-3.0-or-later
-->

<script lang="ts" generics="D extends {url: string}, U">
	import PDFBox from '$lib/components/polleg/PDFBox.svelte';
	import QuestionComponent from '$lib/components/polleg/Question.svelte';
	import ProposalApprove from '$lib/components/polleg/ProposalApprove.svelte';
	import BottomSheet from '$lib/components/BottomSheet.svelte';
	import type { Question } from '$lib/polleg';
	import { type FullPDF, type Box, extractFullPDF, SCALE } from '$lib/pdfcanvas';
	import type { OnProgressParameters } from 'pdfjs-dist';
	import { onMount, onDestroy } from 'svelte';
	import { QUESTION_URL } from '$lib/const';

	let {
		proposal,
		data,
		url,
		questions,
		updateProposals
	}: {
		proposal?: boolean;
		data: D;
		url?: U;
		questions: Question[];
		updateProposals?: (id: number) => Promise<void>;
	} = $props();

	// Function to reload all questions data
	async function reloadAllQuestions() {
		if (!questions) return;
		try {
			// TODO: optimization: batch fetch all questions in one request
			// Reload all questions with updated answers
			const updatedQuestions = await Promise.all(
				questions.map(async (q) => {
					const res = await fetch(QUESTION_URL(q.id), { credentials: 'include' });
					const data = await res.json();
					if (!data.answers) data.answers = [];
					return { ...q, answers: data.answers };
				})
			);

			// Update the questions array
			questions = updatedQuestions;
		} catch (error) {
			console.error('Error reloading questions:', error);
		}
	}

	// Load all questions data with answers on mount
	onMount(async () => {
		if (questions && questions.length > 0) {
			await reloadAllQuestions();
		}
	});

	// Function get total answer count for a question
	let questionsMap = $derived(new Map(questions?.map((q) => [q.id, q]) || []));

	const getFullQuestion = (questionId: number) => questionsMap.get(questionId);
	const getTotalAnswerCount = (questionId: number) =>
		questionsMap.get(questionId)?.answers?.length || 0;

	// Split mode state with smooth animations
	let selectedQuestion: Question | null = $state(null);
	let splitMode = $state(false);
	let isClosing = $state(false); // To handle closing animation
	let isFullscreen = $state(false); // To handle fullscreen mode for Solutions panel
	let mainContainer: HTMLElement | undefined = $state();
	let bookmarkAnimating = $state(false); // For bookmark animation
	let showSheet = $state(false); // For mobile bottom sheet

	let pdf: FullPDF | null = $state(null);
	let boxes: Box[] = $state([]);
	let loaded = $state(0.0); // percentage
	let percentage = $derived(Math.floor(loaded * 100));

	// Track timeouts for cleanup
	let timeouts: ReturnType<typeof setTimeout>[] = [];

	// timeouts with cleanup
	const safeTimeout = (callback: () => void, delay: number) => {
		const timeoutId = setTimeout(() => {
			callback();
			// Remove from tracking array when completed
			timeouts = timeouts.filter((id) => id !== timeoutId);
		}, delay);
		timeouts.push(timeoutId);
		return timeoutId;
	};

	// Split mode functions
	const openSplitMode = (question: Question) => {
		if (selectedQuestion?.id === question.id) {
			closeSplitMode();
			return;
		}

		// Bookmark animation
		bookmarkAnimating = true;
		safeTimeout(() => (bookmarkAnimating = false), 400);

		// Use the full question data instead of the box question reference
		selectedQuestion = getFullQuestion(question.id) || question;
		splitMode = true;
	};

	const closeSplitMode = () => {
		// Start closing animation
		isClosing = true;

		// Wait for CSS animation to finish before removing from DOM
		safeTimeout(() => {
			selectedQuestion = null;
			splitMode = false;
			isClosing = false;
			isFullscreen = false; // Reset fullscreen
		}, 300); // Same duration as CSS transition
	};

	// Toggle fullscreen mode for Solutions panel
	const toggleFullscreen = () => {
		isFullscreen = !isFullscreen;
	};

	const splitBoxes = (boxes: Box[], cuts: Question[]) => {
		cuts.sort((a, b) => (a.start > b.start ? 1 : -1));

		let boxI = 0;
		for (const [i, cut] of cuts.entries()) {
			const start = cut.start * SCALE;
			const end = cut.end * SCALE;

			// Find the box containing the start of the cut
			while (boxI < boxes.length) {
				const box = boxes[boxI];
				if (box.y <= start && start <= box.y + box.height) break;
				else boxI++;
			}

			if (boxI >= boxes.length) continue; // Skip if no box found

			const startBox = boxes[boxI];

			// Check if the cut extends beyond the current box (crosses pages)
			if (end > startBox.y + startBox.height) {
				// Handle cross-page cuts: merge all affected boxes into one
				let endBoxI = boxI;
				let totalHeight = 0;
				let affectedBoxes = [];

				// Find all boxes that the cut spans across
				while (endBoxI < boxes.length && boxes[endBoxI].y < end) {
					const currentBox = boxes[endBoxI];

					// Calculate how much of this box is included in the cut
					const boxStart = Math.max(currentBox.y, start);
					const boxEnd = Math.min(currentBox.y + currentBox.height, end);
					const includedHeight = boxEnd - boxStart;

					if (includedHeight > 0) {
						affectedBoxes.push({
							box: currentBox,
							startOffset: boxStart - currentBox.y,
							height: includedHeight
						});
						totalHeight += includedHeight;
					}
					endBoxI++;
				}

				// Create the merged box for the question
				const mergedQuestionBox = {
					x: startBox.x,
					y: start,
					width: startBox.width,
					height: totalHeight,
					question: cut
				};

				const newBoxes = [];

				// Add the part before the cut (if any)
				// const beforeHeight = start - startBox.y;
				// if (beforeHeight > 0) {
				// 	newBoxes.push({
				// 		...startBox,
				// 		height: beforeHeight
				// 	});
				// }

				// Add the merged question box
				newBoxes.push(mergedQuestionBox);

				// Add remaining parts of boxes after the cut
				for (let i = boxI; i < endBoxI; i++) {
					const currentBox = boxes[i];
					const boxEnd = currentBox.y + currentBox.height;

					if (boxEnd > end) {
						// This box extends beyond the cut
						const remainingHeight = boxEnd - end;
						if (remainingHeight > 0) {
							newBoxes.push({
								...currentBox,
								y: end,
								height: remainingHeight
							});
						}
						break; // No more boxes to process for this cut
					}
				}

				// Replace the affected boxes with the new ones
				boxes = [...boxes.slice(0, boxI), ...newBoxes, ...boxes.slice(endBoxI)];
			} else {
				// Handle single-box cuts (original logic, but fixed)
				const newBoxes = [];
				const b1h = start - startBox.y;
				const b2h = end - start;
				const b3h = startBox.y + startBox.height - end;

				// Part before the cut
				// if (b1h > 0) {
				// 	newBoxes.push({
				// 		...startBox,
				// 		height: b1h
				// 	});
				// }

				// The question box (this is where the question should be assigned)
				const questionBox = {
					...startBox,
					y: start,
					height: b2h,
					question: cut
				};
				newBoxes.push(questionBox);

				if (i + 1 < cuts.length && startBox.y + startBox.height > cuts[i + 1].start * SCALE) {
					newBoxes.push({
						...startBox,
						y: end,
						height: b3h
					});
				}

				boxes = [...boxes.slice(0, boxI), ...newBoxes, ...boxes.slice(boxI + 1)];
			}
		}
		boxes.splice(boxes.length, 1);
		return boxes;
	};

	const init = async () => {
		const { GlobalWorkerOptions, getDocument } = await import('pdfjs-dist');
		GlobalWorkerOptions.workerSrc = new URL(
			'pdfjs-dist/build/pdf.worker.min.mjs',
			import.meta.url
		).toString();

		const loadingPdf = getDocument(url || data.url);
		loadingPdf.onProgress = (params: OnProgressParameters) => {
			loaded = params.loaded / params.total;
		};
		const rawPdf = await loadingPdf.promise;
		pdf = await extractFullPDF(rawPdf);
		boxes = splitBoxes(pdf.pages, questions);
	};

	onMount(init);

	// Cleanup timeouts when component is destroyed
	onDestroy(() => {
		timeouts.forEach(clearTimeout);
		timeouts = [];
	});
</script>

{#if pdf == null || loaded != 1}
	<main class="h-[50vh] flex flex-1 flex-col items-center justify-center">
		<h1 class="text-xl font-bold py-4">Loading PDF: {percentage}%</h1>
		<progress class="progress w-56" value={percentage} max="100"></progress>
	</main>
{:else}
	<!-- Horizontal Split Layout Container -->
	<div class="flex flex-col h-full w-full max-w-6xl" bind:this={mainContainer}>
		<!-- PDF Content Area -->
		<main
			class="transition-all duration-300 ease-out overflow-auto flex flex-col relative {isFullscreen
				? 'hidden'
				: ''}"
			style={splitMode && !isFullscreen ? 'max-height: 50vh;' : ''}
		>
			{#each boxes as box}
				<!-- In split mode, show only the first box (selected question's box) -->
				{#if !splitMode || (splitMode && selectedQuestion && box.question?.id === selectedQuestion.id)}
					<div
						class="relative"
						onclick={splitMode ? closeSplitMode : undefined}
						role={splitMode ? 'button' : undefined}
					>
						<PDFBox {pdf} {box} />
						{#if proposal}
							<ProposalApprove
								p={box.question}
								onupdate={({ id }) => {
									questions = questions.filter((q) => q.id !== id);
									boxes = boxes.filter((b) => b.question.id !== id);
									updateProposals?.(id);
								}}
							></ProposalApprove>
						{/if}

						<!-- Question Bookmark Bubble -->
						{#if box.question && !splitMode && !proposal}
							<!-- Desktop Bookmark Bubble -->
							<button
								class="absolute bottom-4 right-4 w-14 h-14 bg-primary text-primary-content hover:bg-accent transition-all duration-300 ease-out flex items-center justify-center rounded-full shadow-xl hover:shadow-2xl hidden md:flex transform hover:scale-110 z-10 {bookmarkAnimating
									? 'animate-pulse scale-125'
									: ''}"
								onclick={(event) => {
									event.stopPropagation();
									openSplitMode(box.question);
								}}
							>
								<span class="icon-[solar--chat-round-dots-bold] text-xl"></span>
								{#if getTotalAnswerCount(box.question.id) > 0}
									<span
										class="badge badge-secondary badge-xs font-bold text-xs absolute -top-1 -right-1"
									>
										{getTotalAnswerCount(box.question.id)}
									</span>
								{/if}
							</button>

							<!-- Mobile Bookmark -->
							<button
								class="btn btn-primary btn-circle md:hidden shadow-lg absolute top-4 right-4"
								onclick={(event) => {
									event.stopPropagation();
									openSplitMode(box.question);
									showSheet = true;
								}}
							>
								{#if getTotalAnswerCount(box.question.id) > 0}
									<span class="badge badge-secondary badge-xs absolute -top-1 -right-1">
										{getTotalAnswerCount(box.question.id)}
									</span>
								{/if}
								<span class="icon-[solar--chat-round-dots-bold] text-lg"></span>
							</button>
						{/if}
					</div>
				{/if}
			{/each}
		</main>

		<!-- Solutions Panel (Horizontal Split Mode) -->
		{#if splitMode && selectedQuestion && !proposal}
			<!-- Desktop Horizontal Panel -->
			<div
				class="bg-base-100/80 w-full h-full backdrop-blur-xl border-t border-primary/20 shadow-xl transition-all duration-300 ease-out transform {!isClosing &&
				splitMode
					? 'translate-y-0 opacity-100'
					: 'translate-y-full opacity-0'} hidden md:flex flex-col relative overflow-hidden {isFullscreen
					? 'fixed inset-0'
					: ''}"
				style={isFullscreen ? '' : 'height: 50vh; min-height: 20vh; max-height: 80vh;'}
			>
				<!-- Modern header with enhanced glass effect -->
				<div
					class="bg-base-100/90 backdrop-blur-xl border-b border-primary/30 p-4 flex justify-between items-center relative shadow-md"
				>
					<div class="flex items-center gap-3 flex-1">
						<h3 class="text-lg font-semibold text-base-content">Solutions</h3>
						<span class="badge badge-primary badge-sm"
							>{getTotalAnswerCount(selectedQuestion.id)}</span
						>
					</div>

					<div class="flex items-center gap-1">
						<!-- Fullscreen Toggle Button -->
						<div
							class="p-2 btn btn-circle hover:bg-base-200 cursor-pointer transition-all duration-200 ease-out hover:scale-110 opacity-70 hover:opacity-100"
							onclick={toggleFullscreen}
							onkeydown={(e) => e.key === 'Enter' && toggleFullscreen()}
							role="button"
							tabindex="0"
							aria-label={isFullscreen ? 'Exit fullscreen' : 'Expand to fullscreen'}
							title={isFullscreen ? 'Exit fullscreen' : 'Expand to fullscreen'}
						>
							{#if isFullscreen}
								<span class="icon-[solar--minimize-square-bold] text-lg text-base-content"></span>
							{:else}
								<span class="icon-[solar--maximize-square-bold] text-lg text-base-content"></span>
							{/if}
						</div>

						<!-- Close Button -->
						<div
							class="p-2 btn btn-circle hover:bg-error/10 cursor-pointer transition-all duration-200 ease-out hover:scale-110 opacity-70 hover:opacity-100"
							onclick={closeSplitMode}
							onkeydown={(e) => e.key === 'Enter' && closeSplitMode()}
							role="button"
							tabindex="0"
							aria-label="Close solutions panel"
							title="Close solutions panel"
						>
							<span class="icon-[solar--close-circle-bold] text-lg text-error"></span>
						</div>
					</div>
				</div>

				<!-- Content area -->
				<div class="flex-1 overflow-y-auto h-full w-full py-4">
					<QuestionComponent bind:question={selectedQuestion} onAnswerUpdate={reloadAllQuestions} />
				</div>

				<!-- Simple border -->
				<div class="absolute left-0 top-0 w-full h-1 bg-primary opacity-60"></div>
			</div>
		{/if}

		<!-- Mobile Modal (completely separate) -->
		{#if splitMode && selectedQuestion && !proposal}
			<BottomSheet
				bind:open={showSheet}
				onclose={() => {
					showSheet = false;
					closeSplitMode();
				}}
			>
				<div class="py-7 overflow-y-auto h-full">
					<QuestionComponent bind:question={selectedQuestion} onAnswerUpdate={reloadAllQuestions} />
				</div>
			</BottomSheet>
		{/if}
	</div>
{/if}

<style>
	/* Custom scrollbar styling */
	:global(.overflow-auto) {
		scrollbar-width: thin;
		scrollbar-color: oklch(var(--p)) transparent;
	}

	:global(.overflow-auto::-webkit-scrollbar) {
		width: 6px;
	}

	:global(.overflow-auto::-webkit-scrollbar-track) {
		background: transparent;
	}

	:global(.overflow-auto::-webkit-scrollbar-thumb) {
		background: oklch(var(--p) / 0.3);
		border-radius: 3px;
	}

	:global(.overflow-auto::-webkit-scrollbar-thumb:hover) {
		background: oklch(var(--p) / 0.5);
	}
</style>
