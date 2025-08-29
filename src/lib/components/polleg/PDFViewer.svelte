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

	export let data;
	export let questions: Question[];

	// TODO: remove
	let showReplyBoxFor: number | null = null;
	let answers: any[] = [];
	let values: string[] = [];

	let pdf: FullPDF | null = null;
	let boxes: Box[] = [];
	let loaded = 0.0; // percentage
	$: percentage = Math.floor(loaded * 100);

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
	<main class="flex flex-1 flex-col mb-6 max-w-6xl">
		{#each boxes as box, index}
			<PDFBox {pdf} {box} />
			{#if box.question}
				<QuestionComponent question={box.question} />
			{/if}
		{/each}
	</main>
{/if}
