<script lang="ts">
import type { FullPDF, Box } from '$lib/pdfcanvas';
import IntersectionObserver from 'svelte-intersection-observer';
import { renderBox } from '$lib/pdfcanvas';

export let pdf: FullPDF;
export let box: Box;
let canvas: HTMLCanvasElement;
let parent: HTMLSpanElement;
let visible: bool = false;

const render = () => {
  if(!visible)
    return

  renderBox(pdf, canvas, box)
}

$: visible, render(); 
</script>

<IntersectionObserver once element={parent} bind:intersecting={visible}>
  <div
    class="overflow-hidden rounded-xl bg-white mb-6 flex items-center justify-center"
    style={`aspect-ratio: ${box.width/box.height}`}
    bind:this={parent}>
    {#if !visible}
      <span class="loading loading-spinner loading-lg"></span>
    {/if}
    <canvas class="h-full w-full" style={`display: ${visible ? 'block' : 'none'}`} bind:this={canvas} />
  </div>
</IntersectionObserver>
