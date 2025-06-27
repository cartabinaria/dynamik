<script lang="ts">
	import { onMount } from 'svelte';
	import { onDestroy } from 'svelte';
	import type { PageData } from './$types';
	import type { OnProgressParameters } from 'pdfjs-dist';
	import type { PDFPageProxy } from 'pdfjs-dist/types/src/display/api';

	import { toast } from '@zerodevx/svelte-toast';
	import 'carta-md/dark.css';
	import '$lib/styles/github.scss';

	import Answers from '$lib/components/Answers.svelte';
	import PdfCutter from '$lib/components/PdfCutter.svelte';
	import ReplyBox from '$lib/components/ReplyBox.svelte';
	import { page } from '$app/stores';
	import { base } from '$app/paths';

	import type { Degree, Year } from '$lib/teachings';
	import { EDIT_URLS } from '$lib/const';

	export let data: PageData;
	const scale = 3;

	let user = undefined;
	let edit: boolean = false;

	let showReplyBoxFor: number = null;

	let answers: Answers[] = [];
	let values: string[] = [];

	let loaded = 0.0; // percentage
	let pageCanvas: HTMLCanvasElement, fullCanvas: HTMLCanvasElement;
	let canvases: HTMLCanvasElement[] = [];
	let width = 0,
		height = 0;

	let pages: PDFPageProxy[] = [];
	let numPages: number;

	let parentPath = '/';

	onDestroy(() => {
		pageUnsubscribe();
	});

	const pageUnsubscribe = page.subscribe((page) => {
		const path = page.params.dir.split('/');
		path.push(page.params.file);
		path.pop();
		parentPath = base + '/' + path.join('/');
	});

	async function init() {
		await fetchUser();
		if (data?.questions.length === 0) return;
		const pageCtx = pageCanvas.getContext('2d')!;
		const fullCtx = fullCanvas.getContext('2d')!;

		const { GlobalWorkerOptions, getDocument } = await import('pdfjs-dist');
		GlobalWorkerOptions.workerSrc = new URL(
			'pdfjs-dist/build/pdf.worker.min.mjs',
			import.meta.url
		).toString();

		const loadingPdf = getDocument(data.url);
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
			width = Math.max(fullCanvas?.width, viewport.width);
			height += viewport.height;
		}

		fullCanvas.width = width;
		fullCanvas.height = height;
		let currHeight = 0;
		for (const page of pages) {
			const viewport = page.getViewport({ scale });
			pageCanvas.width = viewport.width;
			pageCanvas.height = viewport.height;
			await page.render({
				canvasContext: pageCtx,
				viewport: viewport
			}).promise;

			// copying it over to the full canvas
			fullCtx.drawImage(pageCanvas, 0, currHeight);
			currHeight += viewport.height;

			// cleanup
			pageCtx.clearRect(0, 0, viewport.width, viewport.height);
			pageCanvas.width = 0;
			pageCanvas.height = 0;
		}

		for (let i = 0; i < data.questions.length; i++) {
			const canvas = canvases[i];
			const question = data.questions[i];
			let sHeight: number = (question.end - question.start) * scale;
			canvas.height = sHeight;
			canvas.width = width;
			canvas.style.width = `100%`;
			const ctx = canvas.getContext('2d');
			ctx?.drawImage(fullCanvas, 0, -question.start * scale);
		}
	}

	onMount(init);

	async function fetchUser() {
		let res = await await fetch('http://localhost:3000/whoami', {
			method: 'GET',
			credentials: 'include'
		});

		if (res.status == 200) {
			user = await res.json();
		}
	}

	async function removePdfCutter(dataRet: PageData) {
		edit = false;
		data.questions = dataRet.questions;
		if (data.questions == null) {
			data.questions = [];
		}
		await init();
	}

	function sendAnswerCallback(res, index) {
		if (res.id) {
			toast.push('Success!', {
				theme: {
					'--toastColor': 'mintcream',
					'--toastBackground': 'rgba(72,187,120,0.9)',
					'--toastBarBackground': '#2F855A'
				}
			});
			answers[index].addComment(res);
		} else {
			toast.push('Error!', {
				theme: {
					'--toastColor': 'mintcream',
					'--toastBackground': 'rgba(244,67,54,0.9)',
					'--toastBarBackground': '#e74c3c'
				}
			});
		}
	}

	//function showReplyBox(question, index) {}
	$: isExpanded = true;

	// -- breadcrumbs --
	let editUrls = EDIT_URLS($page.url.pathname);
	let breadcrumbMobile = true;
	function mobileBreadcrumb() {
		breadcrumbMobile = !breadcrumbMobile;
	}

	$: urlParts = $page.url.pathname
		.split('/')
		.slice(1)
		.filter((p) => p !== ''); // otherwise we get an empty string at the end

	const getPartHref = (part: string) =>
		$page.url.pathname
			.split('/')
			.slice(0, $page.url.pathname.split('/').indexOf(part) + 1)
			.join('/');

	function kebabToTitle(str: string) {
		return str
			.split('-')
			.map((s) => s[0].toUpperCase() + s.slice(1))
			.join(' ');
	}

	function titleToAcronym(str: string) {
		return str
			.split(' ')
			.map((s) => s[0].toUpperCase())
			.join('');
	}

	function genTitle(parts: string[]) {
		if (parts.length === 0) return 'Risorse';
		const title = kebabToTitle(parts[0]);

		if (parts.length === 1) {
			return title;
		} else if (parts.length === 2) {
			return titleToAcronym(title) + ' > ' + kebabToTitle(parts[1]);
		} else {
			return titleToAcronym(title) + ' >...> ' + kebabToTitle(parts[parts.length - 1]);
		}
	}

	$: title = genTitle(urlParts);

	// Computes either all mandatory teachings or elective teachings for a year
	function getTeachings(y: Year, electives: boolean): string[] | undefined {
		if (!y) return undefined;
		const studyDiagram = y.teachings;
		if (!studyDiagram) return undefined;
		return electives ? studyDiagram.electives : studyDiagram.mandatory;
	}

	// Checks if a teaching is part of a certain degree
	function isInDegree(teachingName: string, degree: Degree, elective: boolean): boolean {
		const years = degree.years;
		if (!years) return false;
		return !!years.find((y) => getTeachings(y, elective)?.includes(teachingName));
	}

	// Skims through degrees looking for a given teaching
	function skimDegrees(teachingName: string, electives: boolean): string | undefined {
		const degree = data.degrees.find((d) => isInDegree(teachingName, d, electives));
		return degree ? degree.id : undefined;
	}

	// Picks a containing degree for this teaching
	function guessDegree(teachingName: string): string | null {
		// Plan A: "from" url parameter
		if (data.from) return data.from;
		// Plan B: "degree" field in Teachings
		const teaching = data.teachings.get(teachingName);
		if (teaching?.degree) return teaching.degree;
		// Plan C: any degree featuring this teaching as mandatory
		const mandatoryDegree = skimDegrees(teachingName, false);
		if (mandatoryDegree) return mandatoryDegree;
		// Plan D: any degree featuring this teaching as an elective
		const electiveDegree = skimDegrees(teachingName, true);
		if (electiveDegree) return electiveDegree;
		// Plan E: give up
		return null;
	}

	// $: degree = guessDegree(urlParts[0]);
</script>

<main class="max-w-6xl min-w-fit p-4 mx-auto">
	<div class="navbar flex bg-base-200 rounded-box shadow-sm px-5 mb-5">
		<div class="sm:hidden flex justify-start items-center">
			<button class="sm:hidden flex btn btn-ghost btn-sm" on:click={mobileBreadcrumb}>
				<span
					class="sm:hidden flex text-2xl items-center text-accent icon-[solar--folder-path-connect-bold-duotone]"
				>
				</span>
				<p class="text-accent" class:hidden={!breadcrumbMobile}>{title}</p>
			</button>
		</div>
		<div class="navbar min-h-0 p-0 justify-start items-center">
			<div
				class="breadcrumbs sm:flex lg:text-lg sm:items-start text-sm sm:flex-wrap font-semibold"
				class:hidden={breadcrumbMobile}
			>
				<ul>
					<li>
						<a class="ml-1 flex items-center" href="/">
							<span class="text-xl icon-[akar-icons--home-alt1]"></span>
						</a>
					</li>
					<!-- {#if degree}
						<li>
							<a class="flex items-center" href={'/dash/' + degree}>
								<span class="text-xl icon-[ic--round-school]"></span>
							</a>
						</li>
					{/if} -->
					{#each urlParts as part}
						{@const href = getPartHref(part) + '?' + $page.url.searchParams}
						<li><a {href} class="flex flex-wrap whitespace-normal">{part}</a></li>
					{/each}
				</ul>
			</div>
		</div>
		<div class="navbar-end">
			<div class="flex flex-1 justify-end">
				<a
					class="sm:ml-2 p-1 flex items-center rounded-lg btn-ghost flex-shrink-0 w-8"
					href={editUrls.github_repo}
				>
					<span class="text-2xl icon-[akar-icons--github-fill]"></span>
				</a>
			</div>
		</div>
		<div class="flex flex-1 justify-end mr-2">
			{#if user === undefined}
				<button
					class="btn btn-ghost text-accent hover:bg-accent/20 hover:text-base-content"
					on:click|preventDefault={() =>
						(window.location.href =
							'http://localhost:3000/login?redirect_uri=http://localhost:5173' +
							data.url.slice(25))}
				>
					Login with
					<span class="text-2xl icon-[akar-icons--github-fill]"></span>
				</button>
			{:else}
				<details class="dropdown">
					<summary class="btn btn-circle p-2"
						><img src={user.avatarUrl} class="w-12 rounded-full" /></summary
					>
					<ul class="shadow menu dropdown-content">
						<li>
							<button
								class="btn btn-neutral hover:bg-accent/80"
								on:click|preventDefault={() => {
									window.location.href =
										'http://localhost:3000/logout?redirect_uri=http://localhost:5173' +
										data.url.slice(25);
									user = undefined;
								}}
							>
								<div class="inline-flex items-center">
									<span class="icon-[akar-icons--sign-out] mr-2 text-lg"></span>
									<p class="">LogOut</p>
								</div>
							</button>
						</li>
					</ul>
				</details>
			{/if}
		</div>
	</div>
</main>

{#if data.isTest}
	{#if edit}
		<PdfCutter id={data.id} url={data.url} show={removePdfCutter} />
	{:else}
		{#if data?.questions.length === 0}
			<div class="flex justify-center mb-2">
				<div class="text-center">
					<span class="text-5xl icon-[solar--sad-circle-broken]"></span>
					<p class="text-xl mb-8">
						Sorry, but the document isn't ready for responses yet. Please check back soon!
					</p>

					{#if user?.admin}
						<button class="btn btn-ghost" on:click|preventDefault={() => (edit = true)}>
							Preparalo
						</button>
					{/if}
					<button class="btn btn-ghost" on:click|preventDefault={() => history.back()}>
						Torna indietro
					</button>
				</div>
			</div>
			<div class="flex justify-center mb-5">
				<object data={data.url} type="application/pdf" width="90%" height="900vh">
					<iframe src={data.url} width="90%" height="900vh">
						<p>This browser does not support PDF!</p>
					</iframe>
				</object>
			</div>
		{/if}
		<canvas bind:this={pageCanvas} style="display: none" />
		<canvas bind:this={fullCanvas} style="display: none" />
		{#each data?.questions as question, index}
			<div class="w-fit m-16 justify-center">
				<canvas data-id={index} bind:this={canvases[index]} />
				<div class="flex justify-around items-start {isExpanded ? 'flex-wrap' : ''}">
					<div class="collapse collapse-arrow rounded-3xl {isExpanded ? 'mb-3' : 'w-fit'}">
						<input type="checkbox" bind:checked={isExpanded} />
						<div
							class="collapse-title flex items-center justify-start text-lg font-extrabold bg-secondary/70 text-bold rounded-3xl w-fit peer-checked:bg-secondary/20"
						>
							<span class="icon-[solar--chat-line-bold-duotone] text-3xl mr-3"></span>
							Answers
						</div>
						<div
							class="bg-secondary/50 pt-4 collapse-content flex flex-1 flex-col peer-checked:bg-secondary/20 rounded-3xl"
						>
							<div class="flex justify-center flex-1">
								<Answers {user} question={question.id} bind:this={answers[index]} />
							</div>
						</div>
					</div>

					{#if user}
						<div class="collapse rounded-3xl m-1 {isExpanded ? '' : 'w-full'}">
							<input type="checkbox" />
							<div
								class="collapse-title flex items-center justify-center text-lg font-extrabold bg-primary/70 text-bold rounded-3xl w-fit"
							>
								<span class="icon-[solar--add-circle-bold-duotone] text-3xl mr-2"></span>
								Add your answer
							</div>
							<div class="bg-primary/60 collapse-content flex flex-1 flex-col rounded-3xl">
								<ReplyBox
									closeCallback={() => {
										showReplyBoxFor = null;
									}}
									bind:unfinishedReply={values[index]}
									questionIndex={index}
									questionId={question.id}
									{sendAnswerCallback}
								/>
							</div>
						</div>
					{/if}
				</div>
			</div>
			<!--
			{#if showReplyBoxFor == index}
				<div class="fixed bottom-0 w-full z-10"></div>
			{/if} -->
		{/each}
	{/if}
{:else}
	<div class="flex justify-center mb-5">
		<object data={data.url} type="application/pdf" width="90%" height="900vh">
			<iframe src={data.url} width="90%" height="900vh">
				<p>This browser does not support PDF!</p>
			</iframe>
		</object>
	</div>
{/if}

<style>
	canvas {
		width: var(--width);
		height: var(--height);
		padding: 1rem 0;
		border-radius: 0.5rem;
	}
</style>
