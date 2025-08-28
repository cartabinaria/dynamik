<script lang="ts">
	import { onDestroy } from 'svelte';
	import { onMount } from 'svelte';
	import type { PageData } from './$types';

	// import 'carta-md/dark.css';
	import '$lib/styles/github.scss';

	import PdfCutter from '$lib/components/polleg/PdfCutter.svelte';
	import Instructions from '$lib/components/polleg/Instructions.svelte';
	import PDFViewer from '$lib/components/polleg/PDFViewer.svelte';
	import { page } from '$app/stores';
	import { base } from '$app/paths';

	import Navbar from '$lib/components/Navbar.svelte';
	import { WHOAMI_URL } from '$lib/const';

	export let data: PageData;

	let editMode: boolean = false;

	async function removePdfCutter(dataRet: PageData) {
		editMode = false;
		data.questions = dataRet.questions;
		if (data.questions == null) {
			data.questions = [];
		}
	}

	function setEditMode(flag: boolean) {
		editMode = flag;
	}
</script>

<main class="max-w-6xl min-w-fit p-4 mx-auto">
	<Navbar title={$page.params.file} />

  <PDFViewer {data} questions={data.questions} />
  {#if data.questions?.length !== 0 && false}
    <!-- If the questions aren't present show instructions and pdf -->
    <Instructions isAdmin={user?.admin} {setEditMode} />
    <PdfViewer url={data.url} width={'90%'} height={'900vh'} />
    {#if editMode}
      <PdfCutter id={data.id} url={data.url} show={removePdfCutter} {setEditMode} />
    {/if}
  {/if}
  <!-- If it's not an exam, view the pdf -->
  <!-- <PdfViewer url={data.url} width={'90%'} height={'900vh'} /> -->
</main>

<style>
	canvas {
		width: var(--width);
		height: var(--height);
		border-radius: 0.5rem;
	}
</style>
