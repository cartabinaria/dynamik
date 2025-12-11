<!--
SPDX-FileCopyrightText: 2024 - 2025 Eyad Issa <eyadlorenzo@gmail.com>

SPDX-License-Identifier: AGPL-3.0-or-later
-->

<script lang="ts">
	import { EDIT_URLS } from '$lib/const';

	type Props = {
		url: URL;
		degree?: string | null;
		onfuzzy?: (e: Event) => void;
		borderRadius?: string | null;
	};

	let { url, degree, onfuzzy, borderRadius = 'rounded-box' }: Props = $props();

	let path = $derived(url.pathname);
	let searchParams = $derived(url.searchParams);
	let editUrls = $derived(EDIT_URLS(url.pathname));

	// -- breadcrumbs --
	let breadcrumbMobile = $state(true);
	function mobileBreadcrumb() {
		breadcrumbMobile = !breadcrumbMobile;
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

	const getPartHref = (url: string, part: string) =>
		url
			.split('/')
			.slice(0, url.split('/').indexOf(part) + 1)
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

	let urlParts = $derived.by(() =>
		path
			.split('/')
			.slice(1)
			.filter((p) => p !== '')
	);

	let title = $derived(genTitle(urlParts));
</script>

<div class="navbar flex bg-base-200 shadow-xs px-5 {borderRadius}">
	<div class="sm:hidden flex justify-start items-center">
		<div class="dropdown w-max">
			<button
				type="button"
				class="btn btn-ghost flex gap-2 w-max"
				onclick={mobileBreadcrumb}
				aria-label="Open breadcrumb menu"
			>
				<span class="text-lg text-accent icon-[solar--folder-path-connect-bold-duotone]"></span>
				<p class="text-accent text-xs wrap-anywhere">{title}</p>
			</button>

			{#if !breadcrumbMobile}
				<ul tabindex="0" class="dropdown-content menu p-2 shadow bg-base-200 rounded-box w-56 z-50">
					<li>
						<a href="/" class="flex items-center"
							><span class="icon-[ic--round-home]"></span>
							Home
						</a>
					</li>
					{#if degree != null}
						<li>
							<a href={'/dash/' + degree} class="flex items-center">
								<span class="text-xl icon-[ic--round-school]"></span>
								{degree}
							</a>
						</li>
					{/if}
					{#each urlParts as part, i (i)}
						{@const href = getPartHref(path, part) + '?' + searchParams}
						<li><a {href}>{part}</a></li>
					{/each}
				</ul>
			{/if}
		</div>
	</div>
	<div class="navbar min-h-0 p-0 justify-start items-center">
		<div class="breadcrumbs hidden sm:flex lg:text-lg sm:items-center text-sm font-semibold">
			<ul class="flex flex-wrap">
				<li>
					<a class="ml-1 flex items-center" href="/" aria-label="Home">
						<span class="icon-[ic--round-home] text-lg"></span>
					</a>
				</li>
				{#if degree != null}
					<li>
						<a class="flex items-center" href={'/dash/' + degree} aria-label="Degree Dashboard">
							<span class="text-xl icon-[ic--round-school]"></span>
						</a>
					</li>
				{/if}
				{#each urlParts as part, i (i)}
					{@const href = getPartHref(path, part) + '?' + searchParams}
					<li><a {href} class="flex flex-wrap whitespace-normal">{part}</a></li>
				{/each}
			</ul>
		</div>
	</div>
	<div class="navbar-end">
		<div class="flex flex-1 gap-1 justify-end max-w-min">
			<button
				type="button"
				class="btn w-max sm:btn-sm md:btn-md btn-primary border-none rounded-xl bg-linear-to-r from-primary to-accent hover:brightness-105 transition-all duration-200 ease-out gap-2 hover:scale-105"
				aria-label="Apri suggerimenti per contribuire"
				onclick={() => document.getElementById('my_modal_2')?.showModal()}
			>
				<span class="text-2xl icon-[lucide--file-heart]"></span>
				<span class="font-semibold tracking-wide">Dona i tuoi appunti</span>
			</button>
			<dialog id="my_modal_2" class="modal">
				<div
					class="modal-box rounded-2xl bg-base-200/90 backdrop-blur max-w-2xl border border-base-300"
				>
					<div class="flex items-center gap-3">
						<span class="text-4xl text-primary icon-[lucide--file-heart]"></span>
						<div>
							<h3 class="text-xl font-bold">Dona i tuoi appunti</h3>
							<p class="mt-1 text-sm opacity-80">
								Caricare i tuoi file è più semplice di quanto pensi!
							</p>
						</div>
					</div>
					<div class="steps steps-vertical mt-2 *:text-start">
						<div class="step step-primary">
							<div
								class="flex flex-col pt-10 md:pt-0 md:flex-row gap-2 items-start md:items-center h-full"
							>
								<a
									href={editUrls.github_repo}
									class="btn rounded-xl btn-sm btn-primary gap-2 w-full md:w-max"
								>
									<span class="text-2xl icon-[akar-icons--github-fill]"></span>
									<span>Vai alla Repo</span>
								</a>
								<p>
									Fai una <b>fork</b> del repository dell’insegnamento a cui vuoi contribuire.
								</p>
							</div>
						</div>
						<div class="step step-primary">
							<p>
								Aggiungi i tuoi appunti/modifiche nella cartella corretta seguendo la struttura già
								esistente e <b>committa</b> le tue modifiche.
							</p>
						</div>
						<div class="step step-primary">
							<p>
								Fai una <b>pull request</b> verso il repository principale e aspetta che venga approvata
								dai nostri moderatori.
							</p>
						</div>
						<div class="flex flex-col pt-10 md:pt-0 md:flex-row gap-2 items-start md:items-center">
							<a
								href="https://cartabinaria.students.cs.unibo.it/wiki/raccolte-di-risorse/contribuire-a-un-insegnamento/"
								class="btn rounded-xl btn-sm btn-secondary gap-2 w-full md:w-max"
							>
								<span class="text-2xl icon-[material-symbols--menu-book]"></span>
								<span>Vai alla Wiki</span>
							</a>
							<p>Hai bisogno di più informazioni? Leggi la wiki, in cui passo passo ti guidiamo.</p>
						</div>
						<div class="flex flex-col pt-10 md:pt-0 md:flex-row gap-2 items-start md:items-center">
							<a
								href="https://t.me/cartabinaria"
								class="btn rounded-xl btn-sm btn-accent gap-2 w-full md:w-max"
							>
								<span class="text-2xl icon-[ph--telegram-logo-fill]"></span>
								<span>Scrivici</span>
							</a>
							<p>
								Dubbi o domande? Entra nel nostro canale Telegram, c'è sempre qualcuno pronto ad
								aiutarti.
							</p>
						</div>
					</div>
					<div class="mt-4 alert border-info bg-info/20">
						<span class="icon-[ph--lightbulb-filament-bold] text-lg"></span>
						<span>Contribuire è gratuito e aiuta tutta la community. Grazie!</span>
					</div>
				</div>
				<form method="dialog" class="modal-backdrop">
					<button aria-label="Chiudi">Chiudi</button>
				</form>
			</dialog>

			<a
				class="sm:ml-2 p-1 flex items-center rounded-lg btn-ghost shrink-0 w-8"
				aria-label="GitHub Repository"
				href={editUrls.github_repo}
			>
				<span class="text-2xl icon-[akar-icons--github-fill]"></span>
			</a>
		</div>
	</div>
	<div class="flex flex-1 justify-end mr-2">
		{#if onfuzzy != null}
			<button
				title="Search"
				class="lg:ml-2 md:min-w-max p-2 bg-base-300 rounded-xl btn-ghost"
				onclick={(e) => {
					e.preventDefault();
					onfuzzy(e);
				}}
			>
				<span class="text-primary icon-[akar-icons--search] align-middle"></span>
				<span class="hidden md:inline">
					<kbd class="kbd-sm">Ctrl</kbd>+
					<kbd class="kbd-sm">K</kbd>
				</span>
			</button>
		{/if}
	</div>
</div>
