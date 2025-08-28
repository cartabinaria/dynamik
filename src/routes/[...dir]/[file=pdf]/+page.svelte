<!--
SPDX-FileCopyrightText: 2024 - 2025 Eyad Issa <eyadlorenzo@gmail.com>
SPDX-License-Identifier: AGPL-3.0-or-later
-->
<script lang="ts">
	import { onDestroy } from 'svelte';
	import { onMount } from 'svelte';
	import type { PageData } from './$types';
	import '$lib/styles/github.scss';
	import PdfCutter from '$lib/components/polleg/PdfCutter.svelte';
	import Instructions from '$lib/components/polleg/Instructions.svelte';
	import PDFViewer from '$lib/components/polleg/PDFViewer.svelte';
	import Breadcrumbs from '$lib/components/Breadcrumbs.svelte';
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
	
	function genTitle(url: string) {
		const part = url.split('/');
		return part[part.length - 1].split('?')[0];
	}
	
	$: title = genTitle(data.url);
</script>

<svelte:head>
	<title>{title}</title>
	<meta property="og:title" content={title} />
</svelte:head>

<Breadcrumbs url={$page.url} borderRadius={null} />

<main class="max-w-6xl min-w-fit p-4 mx-auto">
	<Navbar title={$page.params.file} />
	
	{#if data.questions !== undefined}
		<!-- Polleg functionality for exam PDFs -->
		<PDFViewer {data} questions={data.questions} />
		{#if data.questions?.length !== 0 && false}
			<!-- If the questions aren't present show instructions and pdf -->
			<Instructions isAdmin={user?.admin} {setEditMode} />
			<PdfViewer url={data.url} width={'90%'} height={'900vh'} />
			{#if editMode}
				<PdfCutter id={data.id} url={data.url} show={removePdfCutter} {setEditMode} />
			{/if}
		{/if}
	{:else}
		<!-- Simple PDF viewer for regular PDFs -->
		<iframe 
			title="Embedded resource" 
			src={data.url} 
			class="h-full w-full border rounded-lg"
		></iframe>
	{/if}
</main>

<style>
	canvas {
		width: var(--width);
		height: var(--height);
		border-radius: 0.5rem;
	}
	
	:global(html),
	:global(body) {
		height: 100%;
	}
</style>