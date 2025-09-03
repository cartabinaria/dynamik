<script lang="ts">
	import { toast } from '@zerodevx/svelte-toast';
	import PDFBox from '$lib/components/polleg/PDFBox.svelte';
	import QuestionComponent from '$lib/components/polleg/Question.svelte';
	import { EDIT_URLS } from '$lib/const';
	import type { Question } from '$lib/polleg';
	import { type FullPDF, type Box, extractFullPDF, SCALE } from '$lib/pdfcanvas';
	import type { OnProgressParameters } from 'pdfjs-dist';
	import type { PDFPageProxy } from 'pdfjs-dist/types/src/display/api';
	import { page } from '$app/stores';
	import { onMount } from 'svelte';
	import { QUESTION_URL } from '$lib/const';

	export let data;
	export let questions: Question[];

	// Helper function to get full question data with all answers
	function getFullQuestion(questionId: number) {
		return questions?.find((q) => q.id === questionId);
	}

	// Function to reload all questions data
	async function reloadAllQuestions() {
		if (!questions) return;

		try {
			// Reload all questions with updated answers
			const updatedQuestions = await Promise.all(
				questions.map(async (q) => {
					const res = await fetch(QUESTION_URL(q.id));
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

	// Reactive helper function to get total answer count for a question
	$: getTotalAnswerCount = (questionId: number) => {
		const fullQuestion = questions?.find((q) => q.id === questionId);
		// Handle case where answers might be null or undefined
		const answersCount = fullQuestion?.answers?.length || 0;
		return answersCount;
	};

	// Split mode state with smooth animations
	let selectedQuestion: Question | null = null;
	let splitMode = false;
	let isClosing = false; // Per gestire l'animazione di chiusura
	let isFullscreen = false; // Per gestire il fullscreen del panel Solutions
	let mainContainer: HTMLElement;
	let bookmarkAnimating = false; // Per animazione del bookmark

	// TODO: remove
	let showReplyBoxFor: number | null = null;
	let answers: any[] = [];
	let values: string[] = [];

	let pdf: FullPDF | null = null;
	let boxes: Box[] = [];
	let loaded = 0.0; // percentage
	$: percentage = Math.floor(loaded * 100);

	// Split mode functions
	const openSplitMode = (question: Question) => {
		if (selectedQuestion?.id === question.id) {
			closeSplitMode();
			return;
		}

		// Bookmark animation
		bookmarkAnimating = true;
		setTimeout(() => (bookmarkAnimating = false), 400);

		// Use the full question data instead of the box question reference
		selectedQuestion = getFullQuestion(question.id) || question;
		splitMode = true;
	};

	const closeSplitMode = () => {
		// Inizia l'animazione di chiusura
		isClosing = true;

		// Aspetta che l'animazione CSS finisca prima di rimuovere dal DOM
		setTimeout(() => {
			selectedQuestion = null;
			splitMode = false;
			isClosing = false;
			isFullscreen = false; // Reset fullscreen quando chiudiamo
		}, 300); // Stessa durata della transizione CSS
	};

	// Toggle fullscreen mode for Solutions panel
	const toggleFullscreen = () => {
		isFullscreen = !isFullscreen;
	};

	// Handle click to close split mode - solo quando in split mode e non sui bookmark!
	function handlePDFClick(event) {
		// Evita di chiudere se si clicca su bookmark o altri controlli
		if (!event.target.closest('button') && !event.target.closest('.badge')) {
			console.log('🖱️ PDF CLICK - Closing split mode');
			closeSplitMode();
		} else {
			console.log('🚫 PDF CLICK on control - NOT closing');
		}
	}
	onMount(() => {
		// Rimuoviamo tutti i listener di scroll
	});

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

				if (cuts.length >= i + 1 && startBox.y + startBox.height > cuts[i + 1].start * SCALE) {
					newBoxes.push({
						...startBox,
						y: end,
						height: b3h
					});
				}

				boxes = [...boxes.slice(0, boxI), ...newBoxes, ...boxes.slice(boxI + 1)];
			}
		}
		boxes.splice(boxes.length - 1, 1);
		return boxes;
	};

	const init = async () => {
		const { GlobalWorkerOptions, getDocument } = await import('pdfjs-dist');
		GlobalWorkerOptions.workerSrc = new URL(
			'pdfjs-dist/build/pdf.worker.min.mjs',
			import.meta.url
		).toString();

		const loadingPdf = getDocument(data.url);
		loadingPdf.onProgress = (params: OnProgressParameters) => {
			loaded = params.loaded / params.total;
		};
		const rawPdf = await loadingPdf.promise;
		pdf = await extractFullPDF(rawPdf);
		boxes = splitBoxes(pdf.pages, questions || []);
	};

	onMount(init);
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
			{#each boxes as box, index}
				<!-- In split mode, show only the first box (selected question's box) -->
				{#if !splitMode || (splitMode && selectedQuestion && box.question?.id === selectedQuestion.id)}
					<div class="relative" on:click={splitMode ? handlePDFClick : undefined}>
						<PDFBox {pdf} {box} />

						<!-- Question Bookmark Bubble -->
						{#if box.question && !splitMode}
							<!-- Desktop Bookmark Bubble -->
							<button
								class="absolute bottom-4 right-4 w-14 h-14 bg-primary text-primary-content hover:bg-accent transition-all duration-300 ease-out flex items-center justify-center rounded-full shadow-xl hover:shadow-2xl hidden md:flex transform hover:scale-110 z-10 {bookmarkAnimating
									? 'animate-pulse scale-125'
									: ''}"
								on:click={() => openSplitMode(box.question)}
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
								on:click={() => openSplitMode(box.question)}
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

					<!-- Non-split mode: show questions inline (MOBILE) -->
					<div class="md:hidden">
						{#if box.question}
							<QuestionComponent question={box.question} onAnswerUpdate={reloadAllQuestions} />
						{/if}
					</div>
				{/if}
			{/each}
		</main>

		<!-- Solutions Panel (Horizontal Split Mode) -->
		{#if splitMode && selectedQuestion}
			<!-- Desktop Horizontal Panel -->
			<div
				class="bg-base-100/80 backdrop-blur-xl border-t border-primary/20 shadow-xl transition-all duration-300 ease-out transform {!isClosing &&
				splitMode
					? 'translate-y-0 opacity-100'
					: 'translate-y-full opacity-0'} hidden md:flex flex-col relative overflow-hidden {isFullscreen
					? 'fixed inset-0 z-50'
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

					<div class="flex items-center gap-2">
						<!-- Fullscreen Toggle Button -->
						<button
							class="btn btn-ghost btn-sm hover:btn-info hover:scale-105 transition-all duration-200 ease-out"
							on:click={toggleFullscreen}
							aria-label={isFullscreen ? 'Esci da schermo intero' : 'Espandi a schermo intero'}
							title={isFullscreen ? 'Esci da schermo intero' : 'Espandi a schermo intero'}
						>
							{#if isFullscreen}
								<span class="icon-[solar--minimize-square-bold] text-xl"></span>
							{:else}
								<span class="icon-[solar--maximize-square-bold] text-xl"></span>
							{/if}
						</button>

						<!-- Close Button with modern styling -->
						<button
							class="btn btn-ghost btn-sm hover:btn-warning hover:scale-105 transition-all duration-200 ease-out"
							on:click={closeSplitMode}
							aria-label="Richiudi pannello soluzioni"
							title="Richiudi pannello"
						>
							<span class="icon-[solar--close-circle-bold] text-xl"></span>
						</button>
					</div>
				</div>

				<!-- Content area -->
				<div class="flex-1 overflow-y-auto h-full p-4">
					<QuestionComponent question={selectedQuestion} onAnswerUpdate={reloadAllQuestions} />
				</div>

				<!-- Simple border -->
				<div class="absolute left-0 top-0 w-full h-1 bg-primary opacity-60"></div>
			</div>
		{/if}

		<!-- Mobile Modal (completely separate) -->
		{#if splitMode && selectedQuestion}
			<div class="fixed inset-0 z-50 md:hidden">
				<div class="modal modal-open">
					<div class="modal-box max-w-full max-h-full h-full w-full rounded-none">
						<div
							class="sticky top-0 bg-base-100 border-b border-base-300 p-4 flex justify-between items-center"
						>
							<h3 class="text-lg font-semibold">Solutions</h3>
							<button
								class="btn btn-ghost btn-sm"
								on:click={closeSplitMode}
								aria-label="Chiudi pannello soluzioni"
							>
								<span class="icon-[solar--close-circle-bold] text-xl"></span>
							</button>
						</div>
						<div class="p-4 overflow-auto">
							<QuestionComponent question={selectedQuestion} onAnswerUpdate={reloadAllQuestions} />
						</div>
					</div>
				</div>
			</div>
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
