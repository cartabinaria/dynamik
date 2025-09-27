/*
SPDX-FileCopyrightText: 2024 Luca Tagliavini <luca@teapot.ovh>
SPDX-FileCopyrightText: 2025 Alice Benatti <alice17bee@gmail.com>

SPDX-License-Identifier: AGPL-3.0-or-later
*/

import type { PageViewport, PDFDocumentProxy, PDFPageProxy } from 'pdfjs-dist';
import type { Question } from './polleg.svelte';

export const SCALE = 3;

export interface Box {
	x: number;
	y: number;
	height: number;
	width: number;
	question?: Question;
}

export interface Page extends Box {
	pdf: PDFPageProxy;
	viewport: PageViewport;
}

export const getPages = async (pdf: PDFDocumentProxy): Promise<Page[]> => {
	const pages = [];
	let y = 0;
	for (let i = 1; i <= pdf.numPages; i++) {
		const page = await pdf.getPage(i);

		// rendering onto the temporary canvas
		const viewport = page.getViewport({ scale: SCALE });
		pages.push({
			pdf: page,
			viewport: viewport,
			x: viewport.offsetX,
			y: y,
			height: viewport.height,
			width: viewport.width
		});
		y += viewport.height;
	}
	return pages;
};

export interface FullPDF {
	pdf: PDFDocumentProxy;
	maxHeight: number;
	canvases: HTMLCanvasElement[];
	pages: Page[];
	width: number;
	height: number;
}

export const extractFullPDF = async (pdf: PDFDocumentProxy): Promise<FullPDF> => {
	// Use a sensible default max height for canvas (common browser limit)
	const MAX_CANVAS_HEIGHT = 32767;

	const result: FullPDF = {
		pdf,
		maxHeight: MAX_CANVAS_HEIGHT,
		canvases: [],
		pages: [],
		width: 0,
		height: 0
	};

	result.pages = await getPages(pdf);
	result.width = Math.max(...result.pages.map((page) => page.width));
	result.height = result.pages.reduce((acc, page) => acc + page.height, 0);

	const pageCanvas = document.createElement('canvas');
	const pageCtx = pageCanvas.getContext('2d')!;
	let availableHeight = 0;
	// This loop creates canvases as needed to then copy-paste the current page
	// rendered from the pageCanvas into this new canvas. The list of canvases
	// generated this way contains the full pdf rendered.
	for (const page of result.pages) {
		pageCanvas.height = page.height;
		pageCanvas.width = page.width;
		await page.pdf.render({
			canvasContext: pageCtx,
			viewport: page.viewport
		}).promise;

		// We need to add a new canvas
		if (page.y + page.height > availableHeight) {
			const ele = document.createElement('canvas');
			result.canvases.push(ele);
			ele.width = result.width;
			ele.height = result.maxHeight;
			availableHeight += result.maxHeight;
		}

		let lastCanvas = result.canvases[result.canvases.length - 1];
		let lastCanvasCtx = lastCanvas.getContext('2d') as CanvasRenderingContext2D;
		let lastCanvasStartY = result.maxHeight * (result.canvases.length - 1);
		let previousCanvas = result.canvases[result.canvases.length - 2];

		if (page.y < lastCanvasStartY) {
			let previousCanvasCtx = previousCanvas.getContext('2d') as CanvasRenderingContext2D;
			// Part of this page can still fit in the previous canvas, although
			// we needed a new one to fully fit this page.
			const yForPrevious = page.y % result.maxHeight;
			previousCanvasCtx.drawImage(pageCanvas, 0, yForPrevious);
			// The y offset needed so that the part already drawn is out of the current canvas.
			// Thus, it is equal to the amount of lines already drawn in the prev canvas
			const drawnLines = result.maxHeight - yForPrevious;
			lastCanvasCtx.drawImage(pageCanvas, 0, -drawnLines);
		} else {
			// This whole page fits in the latest canvas
			lastCanvasCtx.drawImage(pageCanvas, 0, page.y % result.maxHeight);
		}

		// cleanup
		pageCtx.clearRect(0, 0, page.width, page.height);
		pageCanvas.width = 0;
		pageCanvas.height = 0;
	}
	pageCanvas.remove();
	return result;
};

export const renderBox = (pdf: FullPDF, canvas: HTMLCanvasElement, box: Box) => {
	canvas.height = box.height;
	canvas.width = box.width;
	const ctx = canvas.getContext('2d') as CanvasRenderingContext2D;
	const off = box.y % pdf.maxHeight;
	const startCanvasI = Math.floor(box.y / pdf.maxHeight);
	const endCanvasI = Math.floor((box.y + box.height - 1) / pdf.maxHeight);

	// Add safety checks to prevent the TypeError
	if (!pdf.canvases[startCanvasI]) {
		console.error(`Canvas at index ${startCanvasI} is undefined`);
		return;
	}

	if (startCanvasI === endCanvasI) {
		// Box fits in a single canvas
		const off = box.y % pdf.maxHeight;
		ctx.drawImage(pdf.canvases[startCanvasI], 0, -off);
	}
	if (off + box.height > pdf.maxHeight) {
		// This box sits between two canvases
		if (!pdf.canvases[startCanvasI + 1]) {
			console.error(`Canvas at index ${startCanvasI + 1} is undefined`);
			return;
		}
		ctx.drawImage(pdf.canvases[startCanvasI], 0, -off);
		ctx.drawImage(pdf.canvases[startCanvasI + 1], 0, pdf.maxHeight - off);
	} else {
		// Box spans multiple canvases
		let currentY = 0;
		let remainingHeight = box.height;

		for (let canvasI = startCanvasI; canvasI <= endCanvasI && remainingHeight > 0; canvasI++) {
			if (!pdf.canvases[canvasI]) {
				console.error(`Canvas at index ${canvasI} is undefined`);
				break;
			}

			const canvasStartY = canvasI * pdf.maxHeight;
			const boxStartInCanvas = Math.max(0, box.y - canvasStartY);
			const boxEndInCanvas = Math.min(pdf.maxHeight, box.y + box.height - canvasStartY);
			const heightInThisCanvas = boxEndInCanvas - boxStartInCanvas;

			if (heightInThisCanvas > 0) {
				// Draw the part of the box that belongs to this canvas
				ctx.drawImage(
					pdf.canvases[canvasI],
					0, // sourceX
					boxStartInCanvas, // sourceY
					pdf.canvases[canvasI].width, // sourceWidth
					heightInThisCanvas, // sourceHeight
					0, // destX
					currentY, // destY
					canvas.width, // destWidth
					heightInThisCanvas // destHeight
				);

				currentY += heightInThisCanvas;
				remainingHeight -= heightInThisCanvas;
			}
		}
	}
};
