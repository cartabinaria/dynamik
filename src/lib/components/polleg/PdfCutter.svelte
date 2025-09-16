<!-- 
SPDX-FileCopyrightText: 2024 geno <gabriele.genovese2@studio.unibo.it>
SPDX-FileCopyrightText: 2025 Alice Benatti <alice17bee@gmail.com>

SPDX-License-Identifier: AGPL-3.0-or-later
 -->

<script lang="ts">
	import { onMount } from 'svelte';
	import type { OnProgressParameters } from 'pdfjs-dist';
	import type { PDFPageProxy } from 'pdfjs-dist/types/src/display/api';
	import { POLLEG_BASE_URL, PROPOSAL_URL } from '$lib/const';
	import { toast } from '$lib/toast';
	import { page } from '$app/stores';

	const ENDPOINT = POLLEG_BASE_URL + '/documents';

	let { url, id, setEditMode, show, isAdmin } = $props<{
		url: string;
		id: string;
		setEditMode: (flag: boolean) => void;
		show: (arg0: any) => void;
		isAdmin?: boolean;
	}>();

	// State for instructions visibility
	let showInstructions = $state(true);

	let editCanvas: HTMLCanvasElement, editContext: any;
	let opacityCanvas: HTMLCanvasElement, opacityContext: any;
	let fullCanvas: HTMLCanvasElement, fullContext: any;
	let pageCanvas: HTMLCanvasElement, pageContext: any;
	let pages: PDFPageProxy[] = [];
	let lines: number[][] = [];
	lines[0] = [];
	lines[1] = [];
	let current = 0;
	const strokeSize = 3;
	let totalWidth = 0;
	let totalHeight = 0;
	let numPages = 0;
	let loaded = 0.0; // percentage
	const scale = 2;

	let ratio = 1;

	let lastEventMovingArea = {};
	let lastY = 0;
	let initialScrollTop = 0;

	onMount(async () => {
		editContext = editCanvas.getContext('2d');
		opacityContext = opacityCanvas.getContext('2d');

		pageContext = pageCanvas.getContext('2d')!;
		fullContext = fullCanvas.getContext('2d')!;

		ratio = fullCanvas.height / fullCanvas.getBoundingClientRect().height;

		const { GlobalWorkerOptions, getDocument } = await import('pdfjs-dist');
		GlobalWorkerOptions.workerSrc = new URL(
			'pdfjs-dist/build/pdf.worker.min.mjs',
			import.meta.url
		).toString();

		const loadingPdf = getDocument(url);
		loadingPdf.onProgress = (params: OnProgressParameters) => {
			loaded = params.loaded / params.total;
		};
		const pdf = await loadingPdf.promise;
		numPages = pdf.numPages;

		for (let i = 1; i <= pdf.numPages; i++) {
			const page = await pdf.getPage(i);
			pages.push(page);

			// rendering onto the temporary canvas
			const viewport = page.getViewport({ scale });
			totalWidth = Math.max(fullCanvas?.width, viewport.width);
			totalHeight += viewport.height;
		}

		fullCanvas.width = totalWidth;
		fullCanvas.height = totalHeight;
		opacityCanvas.width = totalWidth;
		opacityCanvas.height = totalHeight;
		editCanvas.width = totalWidth;
		editCanvas.height = totalHeight;
		let currHeight = 0;
		for (const page of pages) {
			const viewport = page.getViewport({ scale });
			pageCanvas.width = viewport.width * scale;
			pageCanvas.height = viewport.height * scale;
			await page.render({
				canvasContext: pageContext,
				viewport: viewport
			}).promise;

			// copying it over to the full canvas
			fullContext.drawImage(pageCanvas, 0, currHeight);
			currHeight += viewport.height;

			// cleanup
			pageContext.clearRect(0, 0, viewport.width, viewport.height);
			pageCanvas.width = 0;
			pageCanvas.height = 0;
		}
	});

	// called in scroll event
	function fireLastMouseEvent(ev: any) {
		ratio = fullCanvas.height / fullCanvas.getBoundingClientRect().height;
		if (current === 0) initialScrollTop = window.scrollY;
		let x = ev.pageX;
		lastEventMovingArea = {
			clientX: x,
			clientY: lastY + window.scrollY - initialScrollTop,
			iSTrusted: false
		};
		if (lastEventMovingArea) ev_mousemove(lastEventMovingArea);
	}

	// mousemove event handler.
	function ev_mousemove(ev: any) {
		if (current === 0) return;
		ratio = fullCanvas.height / fullCanvas.getBoundingClientRect().height;

		// only for 'true' mouse event
		if (ev.isTrusted) {
			// store the clientX and clientY props in an object
			const { clientX, clientY } = ev;
			lastEventMovingArea = { clientX, clientY };
		}

		// get the relative x and y positions from the mouse event
		let point = getRelativePointFromEvent(ev, opacityCanvas);
		if (!ev.isTrusted) point = { x: ev.clientX, y: ev.clientY };
		point.y = point.y * ratio;
		opacityContext.beginPath();

		redrawAllOpaqueSections();
		opacityContext.clearRect(0, 0, opacityCanvas.width, opacityCanvas.height);
		let height = Math.abs(lastY - point.y);
		if (lastY < point.y)
			opacityContext.rect(0, lastY + strokeSize / 2, opacityCanvas.width, height);
		else opacityContext.rect(0, point.y - strokeSize / 2, opacityCanvas.width, height);

		opacityContext.fillStyle = 'rgba(0,0,0,0.4)';
		opacityContext.fill();
	}

	function getY(ev: Event) {
		// get the relative x and y positions from the mouse event
		const point = getRelativePointFromEvent(ev, fullCanvas);
		return point.y;
	}

	// check whether exists a section(s) containing the given y
	function existsInLines(y: number) {
		let secs = [];
		for (let i = lines[0].length - 1; i >= 0; i--) {
			if ((lines[0][i] >= y && lines[1][i] <= y) || (lines[1][i] >= y && lines[0][i] <= y)) {
				secs.push(i);
			}
		}
		return secs;
	}

	// check whether exists a section in the section defined by idx
	function checkInsideLines(idx: number) {
		let secs = [];
		let y1 = lines[0][idx];
		let y2 = lines[1][idx];
		for (let i = lines[0].length - 1; i >= 0; i--) {
			if (
				i != idx &&
				((lines[0][i] > y1 && lines[1][i] < y2) || (lines[0][i] > y2 && lines[1][i] < y1))
			) {
				secs.push(i);
			}
		}
		return secs;
	}

	function clearSections(idxs: number[]) {
		ratio = fullCanvas.height / fullCanvas.getBoundingClientRect().height;
		for (const idx of idxs) {
			let size = Math.abs(lines[1][idx] - lines[0][idx]);
			let start = lines[0][idx];
			if (lines[0][idx] > lines[1][idx]) start = lines[1][idx];

			opacityContext.clearRect(0, start, opacityCanvas.width, size);
			editContext.clearRect(0, start - strokeSize, editCanvas.width, size + strokeSize * 2);
			lines[0].splice(lines[0].indexOf(lines[0][idx]), 1);
			lines[1].splice(lines[1].indexOf(lines[1][idx]), 1);
		}
	}

	function redrawAllOpaqueSections() {
		opacityContext.beginPath();
		opacityContext.clearRect(0, 0, opacityCanvas.width, opacityCanvas.height);
		for (let i = 0; i < lines[0].length; i++) {
			let y1 = lines[0][i];
			let y2 = lines[1][i];
			let size = Math.abs(y1 - y2) - strokeSize;
			if (y1 < y2) {
				opacityContext.rect(0, y1 + strokeSize / 2, opacityCanvas.width, size);
			} else {
				opacityContext.rect(0, y2 + strokeSize / 2, opacityCanvas.width, size);
			}
		}
		opacityContext.fill();
	}

	function ev_mousedown(ev: any) {
		ratio = fullCanvas.height / fullCanvas.getBoundingClientRect().height;
		let y = getY(ev) * ratio;
		if (ev.buttons == 1) {
			let idx = existsInLines(y);
			if (idx.length > 0) return;
			editContext.setLineDash([16, 16]);
			editContext.beginPath();

			editContext.lineWidth = strokeSize;
			editContext.lineCap = 'round';
			// editContext.strokeStyle = current == 0 ? '#008000' : '#8B0000';
			editContext.strokeStyle = 'black';
			editContext.moveTo(0, y);
			editContext.lineTo(totalWidth, y);
			editContext.stroke();

			if (!lines[current].includes(y)) lines[current].push(y);
			// closing section
			if (current === 1) {
				let idx = checkInsideLines(lines[0].length - 1);
				if (idx.length > 0) clearSections(idx);
				redrawAllOpaqueSections();
				// document.getElementById('cat').style.top = `${y - 180}px`;
			} else lastY = y;
			current = 1 - current;
		} else if (ev.buttons == 2) {
			if (lines[current].length == 0) return;
			let idx = existsInLines(y);
			if (idx.length > 0) clearSections(idx);
		}
	}

	function getRelativePointFromEvent(ev: any, elem: any) {
		// first find the bounding rect of the element
		const bbox = elem.getBoundingClientRect();
		// subtract the bounding rect from the client questions
		const x = ev.clientX - bbox.left;
		const y = ev.clientY - bbox.top;

		return { x, y };
	}

	async function exportData(e: any) {
		ratio = fullCanvas.height / fullCanvas.getBoundingClientRect().height;
		let data: any = { id, coords: [] };
		for (let i = 0; i < lines[0].length; i++) {
			if (lines[0][i] && lines[1][i]) {
				let s: number = Math.trunc(lines[0][i] / scale),
					e: number = Math.trunc(lines[1][i] / scale);
				if (s < e) data.coords.push({ start: s, end: e });
				else data.coords.push({ start: e, end: s });
			}
		}

		data.coords.sort((a: number[], b: number[]) => a[0] - b[0]);

		// Use different endpoint based on user type
		const endpoint = isAdmin ? ENDPOINT : PROPOSAL_URL;

		data.document_path = $page.url.pathname;

		let res = await fetch(endpoint, {
			headers: {
				'Content-Type': 'application/json'
			},
			body: JSON.stringify(data),
			method: 'POST',
			credentials: 'include'
		});
		let objRet = await res.json();
		if (res.status == 200) {
			const successMessage = isAdmin
				? 'PDF successfully prepared! Students can now answer questions.'
				: 'Proposal submitted successfully! Admins will review it soon.';

			toast.success(successMessage);
			show(objRet);
		} else {
			toast.error('Error: ' + objRet.error);
			setEditMode(false);
			// location.reload();
		}
	}
</script>

<svelte:window
	on:scroll={fireLastMouseEvent}
	on:mousemove={ev_mousemove}
	on:contextmenu|preventDefault={() => {}}
/>

<!-- Instructions for PDF preparation - positioned at top -->
{#if showInstructions}
	<div
		class="fixed top-2 left-1/2 transform -translate-x-1/2 z-[1000] w-[90%] max-w-md bg-info rounded-lg p-4 mb-4 text-sm text-left cursor-pointer hover:bg-info/90 transition-colors"
		onclick={() => (showInstructions = false)}
		role="button"
		tabindex="0"
		onkeydown={(e) => e.key === 'Enter' && (showInstructions = false)}
	>
		<h3 class="font-semibold mb-2 text-info-content">How to prepare a PDF:</h3>
		<ul class="list-disc list-inside space-y-1 text-info-content">
			<li>Use <u>left click</u> to start selecting questions</li>
			<li>Use <u>right click</u> to delete a selection</li>
			<li>Select each question from start to end</li>
			<li>Click {isAdmin ? 'EXPORT' : 'PROPOSE'} when done</li>
		</ul>
		{#if !isAdmin}
			<div class="mt-3 p-2 bg-warning rounded text-warning-content">
				<strong>Note:</strong> Your preparation will be sent as a proposal for admin approval.
			</div>
		{/if}
		<div class="mt-2 text-xs text-info-content/70 text-center">
			Click to hide these instructions
		</div>
	</div>
{/if}

<div id="container" class="text-center">
	<canvas bind:this={pageCanvas} class="hidden"></canvas>
	<canvas bind:this={fullCanvas} class="absolute flex-shrink-0 w-full top-20 left-0 right-0 mx-auto"
	></canvas>
	<canvas bind:this={editCanvas} class="absolute flex-shrink-0 w-full top-20 left-0 right-0 mx-auto"
	></canvas>
	<canvas
		bind:this={opacityCanvas}
		onmousedown={ev_mousedown}
		class="absolute flex-shrink-0 w-full top-20 left-0 right-0 mx-auto"
	></canvas>
</div>
<!-- <canvas bind:this={canvasMerged} id="canvasMerged"></canvas> -->

<div class="fixed top-[90%] left-0 right-0 text-center z-[1001]">
	<button onclick={show} type="button" class="btn btn-neutral rounded-lg border-0">CANCEL</button>
	<button
		onclick={exportData}
		type="button"
		id="exportBtn"
		class="btn btn-primary hover:glass hover:bg-primary rounded-lg border-0"
		>{isAdmin ? 'EXPORT' : 'PROPOSE'}<span class="icon-[ic--round-send]"></span></button
	>
</div>
