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
		}, 300); // Stessa durata della transizione CSS
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
		for (const cut of cuts) {
			const start = cut.start * SCALE;
			const end = cut.end * SCALE;
			// Pick the correct box to split
			while (boxI < boxes.length) {
				const box = boxes[boxI];
				if (box.y <= start && start <= box.y + box.height) break;
				else boxI++;
			}
			const box = boxes[boxI];

			// TODO: we need to handle splits going across multiple pages
			// Although it is probably very unlikely
			const newBoxes = [];
			const b1h = start - box.y;
			const b1 = {
				...box,
				height: b1h,
				question: cut
			};
			if (b1.height <= 0) throw Error('PDF height before question split is 0');

			newBoxes.push(b1);
			const b2 = {
				...box,
				y: box.y + b1h,
				height: box.height - b1h
			};
			if (b2.height > 0) newBoxes.push(b2);

			boxes = [...boxes.slice(0, boxI), ...newBoxes, ...boxes.slice(boxI + 1)];
		}

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
	<div class="flex flex-col h-full w-full max-w-6xl mx-6" bind:this={mainContainer}>
		<!-- PDF Content Area -->
		<main
			class="transition-all duration-300 ease-out overflow-auto flex flex-col relative"
			style={splitMode ? 'max-height: 50vh;' : ''}
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
					: 'translate-y-full opacity-0'} hidden md:flex flex-col relative overflow-hidden"
				style="height: 50vh; min-height: 20vh; max-height: 80vh;"
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
