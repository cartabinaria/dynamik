<!--
SPDX-FileCopyrightText: 2025 Alice Benatti <alice17bee@gmail.com>

SPDX-License-Identifier: AGPL-3.0-or-later
-->

<script lang="ts">
	import type { Snippet } from 'svelte';

	type Props = {
		open?: boolean;
		onclose?: () => void;
		children: Snippet;
		key: number;
	};
	let { open = $bindable(false), onclose, children, key }: Props = $props();

	let sheet: HTMLDivElement;
	let startY = 0;
	let currentY = 0;
	let lastTranslate = 100;
	let translateY = $state(100); // 0 = open, 100 = closed

	// Snap points: full screen, mid, closed
	const SNAP_POINTS = [0, 50, 100]; // 0 = top, 50 = middle, 100 = bottom

	function handleTouchStart(e: TouchEvent) {
		startY = e.touches[0].clientY;
		lastTranslate = translateY;
	}

	function handleTouchMove(e: TouchEvent) {
		e.preventDefault(); // prevent pull-to-refresh
		currentY = e.touches[0].clientY;
		const diff = currentY - startY;
		const deltaPercent = (diff / window.innerHeight) * 100;
		translateY = Math.min(100, Math.max(-5, lastTranslate + deltaPercent));
	}

	function handleTouchEnd() {
		// find the closest snap point
		let closest = SNAP_POINTS.reduce((prev, curr) =>
			Math.abs(curr - translateY) < Math.abs(prev - translateY) ? curr : prev
		);

		// special rule: if the user drags down a lot (>80%), always close
		if (translateY > 80) {
			closest = 100;
		}

		translateY = closest;

		if (translateY === 100) {
			open = false;
			onclose?.();
		} else {
			open = true;
		}
	}

	$effect(() => {
		translateY = open ? 50 : 100; // default open = half screen
	});
</script>

<div
	bind:this={sheet}
	class="fixed inset-x-0 bottom-0 z-50 bg-base-100 brightness-150 rounded-t-2xl shadow-lg transition-transform duration-300 ease-out touch-none h-[80%]"
	style="transform: translateY({translateY}%);"
	ontouchstart={handleTouchStart}
	ontouchmove={handleTouchMove}
	ontouchend={handleTouchEnd}
>
	<div class="flex justify-center py-2 cursor-grab active:cursor-grabbing">
		<div class="w-12 h-1.5 bg-gray-400 rounded-full"></div>
	</div>
	<div class="p-4 h-[90%] overflow-y-auto *:brightness-80">
		{#key key}
			{@render children()}
		{/key}
	</div>
</div>
