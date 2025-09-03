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
	import { auth, isAuthenticated } from '$lib/stores/auth';
	import { page } from '$app/stores';
	import { base } from '$app/paths';
	import { WHOAMI_URL } from '$lib/const';

	export let data: PageData;

	let editMode: boolean = false;

	// Reactive variables for auth
	$: user = isAuthenticated($auth) ? $auth.user : null;
	$: isAdmin = user?.admin || false;
	$: userIsAuthenticated = isAuthenticated($auth);

	async function removePdfCutter(dataRet: PageData) {
		editMode = false;
		data.questions = dataRet.questions;
		if (data.questions == null) {
			data.questions = [] as any;
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

<div class="flex flex-col h-screen overflow-hidden">
	<!-- Fixed navbar -->
	<div class="flex-shrink-0 z-10">
		<Breadcrumbs url={$page.url} borderRadius={null} />
	</div>

	<!-- Scrollable content area -->
	<div class="flex-1 overflow-y-auto overflow-x-hidden">
		<main class="max-w-6xl min-w-fit p-4 mx-auto h-full">
			{#if data.questions !== undefined}
				<!-- Polleg functionality for exam PDFs -->
				{#if data.questions?.length > 0}
					<PDFViewer {data} questions={data.questions} />
				{:else}
					<!-- If the questions aren't present show instructions and pdf -->
					<Instructions {isAdmin} isAuthenticated={userIsAuthenticated} {setEditMode} />
					<iframe title="Embedded resource" src={data.url} class="w-full border rounded-lg h-full"
					></iframe>
					{#if editMode}
						<PdfCutter id={data.id} url={data.url} show={removePdfCutter} {setEditMode} {isAdmin} />
					{/if}
				{/if}
			{:else}
				<!-- Simple PDF viewer for regular PDFs -->
				<iframe title="Embedded resource" src={data.url} class="w-full border rounded-lg h-full"
				></iframe>
			{/if}
		</main>
	</div>
</div>
