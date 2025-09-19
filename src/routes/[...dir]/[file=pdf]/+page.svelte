<!--
SPDX-FileCopyrightText: 2025 Alice Benatti <alice17bee@gmail.com>
SPDX-FileCopyrightText: 2024 Luca Tagliavini <luca@teapot.ovh>
SPDX-FileCopyrightText: 2024 geno <gabriele.genovese2@studio.unibo.it>
SPDX-FileCopyrightText: 2024 - 2025 Eyad Issa <eyadlorenzo@gmail.com>

SPDX-License-Identifier: AGPL-3.0-or-later
-->

<script lang="ts">
	import { onMount } from 'svelte';
	import type { PageData, PageProps } from './$types';
	import '$lib/styles/github.scss';
	import PdfCutter from '$lib/components/polleg/PdfCutter.svelte';
	import Instructions from '$lib/components/polleg/Instructions.svelte';
	import PDFViewer from '$lib/components/polleg/PDFViewer.svelte';
	import Breadcrumbs from '$lib/components/Breadcrumbs.svelte';
	import { auth, isAuthenticated, checkAuth } from '$lib/stores/auth';
	import { page } from '$app/stores';
	import settings from '$lib/settings';

	let { data }: PageProps = $props();

	let editMode = $state(false);

	onMount(async () => {
		await checkAuth(fetch);
	});

	// Reactive variables for auth
	let user = $state(isAuthenticated($auth) ? $auth.user : null);
	let isAdminAndMember = $state(['admin', 'member'].includes(user?.role ?? ''));
	let userIsAuthenticated = $state(isAuthenticated($auth));

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

	let title = $state(genTitle(data.url));
	let pollegPreference = $state($settings.pollegPreference)
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
			<!-- Polleg Preference -->

			<div class="tabs tabs-box w-max my-4">
				<input
					type="radio"
					name="pdf"
					class="tab"
					aria-label="PDF"
					bind:group={pollegPreference}
					value={false}
				/>
				<input
					type="radio"
					name="polleg"
					class="tab"
					aria-label="Q&A"
					bind:group={pollegPreference}
					value={true}
				/>
			</div>
			{#if data.questions !== undefined && pollegPreference}
				<!-- Polleg functionality for exam PDFs -->
				{#if data.questions?.length > 0}
					<PDFViewer {data} questions={data.questions} />
				{:else if data.questions?.length == 0}
					<!-- If the questions aren't present show instructions and pdf -->
					<Instructions {isAdminAndMember} isAuthenticated={userIsAuthenticated} {setEditMode} />
					<iframe title="Embedded resource" src={data.url} class="w-full border rounded-lg h-full"
					></iframe>
					{#if editMode}
						<PdfCutter
							id={data.id}
							url={data.url}
							show={removePdfCutter}
							{setEditMode}
							{isAdminAndMember}
						/>
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
