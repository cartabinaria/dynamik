<!-- 
SPDX-FileCopyrightText: 2024 Luca Tagliavini <luca@teapot.ovh>
SPDX-FileCopyrightText: 2025 Alice Benatti <alice17bee@gmail.com>

SPDX-License-Identifier: AGPL-3.0-or-later
 -->

<script lang="ts">
	import type { FullPDF, Box } from '$lib/pdfcanvas';
	import IntersectionObserver from 'svelte-intersection-observer';
	import { renderBox } from '$lib/pdfcanvas';

	let { pdf, box, proposal } = $props<{ pdf: FullPDF; box: Box; proposal: boolean }>();

	let canvas: HTMLCanvasElement | undefined = $state();
	let parent: HTMLSpanElement | undefined = $state();
	let visible: boolean = $state(false);

	const render = () => {
		if (!visible) return;

		renderBox(pdf, canvas, box);
	};

	$effect(() => {
		render();
	});
</script>

<IntersectionObserver once element={parent} bind:intersecting={visible}>
	<div
		class="overflow-hidden rounded-xl bg-white mb-6 flex items-center justify-center"
		style={`aspect-ratio: ${box.width / box.height}`}
		bind:this={parent}
	>
		{#if !visible}
			<span class="loading loading-spinner loading-lg"></span>
		{/if}
		<canvas
			class="h-full w-full"
			style={`display: ${visible ? 'block' : 'none'}`}
			bind:this={canvas}
		></canvas>
	</div>
</IntersectionObserver>
