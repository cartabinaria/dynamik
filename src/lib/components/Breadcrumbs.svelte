<!--
SPDX-FileCopyrightText: 2024 - 2026 Eyad Issa <eyadlorenzo@gmail.com>

SPDX-License-Identifier: AGPL-3.0-or-later
-->

<script lang="ts">
	import { EDIT_URLS } from '$lib/const';

	import SolarFolderIcon from '@iconify-svelte/solar/folder-path-connect-bold-duotone';
	import IcRoundHomeIcon from '@iconify-svelte/ic/round-home';
	import IcRoundSchoolIcon from '@iconify-svelte/ic/round-school';
	import LucideFileHeartIcon from '@iconify-svelte/lucide/file-heart';
	import AkarIconsGithubFillIcon from '@iconify-svelte/akar-icons/github-fill';
	import MaterialSymbolsMenuBookIcon from '@iconify-svelte/material-symbols/menu-book';
	import PhTelegramLogoFillIcon from '@iconify-svelte/ph/telegram-logo-fill';
	import AkarIconsSearchIcon from '@iconify-svelte/akar-icons/search';
	import PhLightbulbFilamentBoldIcon from '@iconify-svelte/ph/lightbulb-filament-bold';

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

	let showModal = $state(false); // modal handler for contribute button

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
				<SolarFolderIcon class="text-lg text-accent w-4 h-4" />
				<p class="text-accent text-xs wrap-anywhere">{title}</p>
			</button>

			{#if !breadcrumbMobile}
				<ul class="dropdown-content menu p-2 shadow bg-base-200 rounded-box w-56 z-50">
					<li>
						<a href="/" class="flex items-center">
							<IcRoundHomeIcon class="w-4 h-4" />
							Home
						</a>
					</li>
					{#if degree != null}
						<li>
							<a href={'/dash/' + degree} class="flex items-center">
								<IcRoundSchoolIcon class="w-4 h-4" />
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
						<IcRoundHomeIcon class="w-6 h-6" />
					</a>
				</li>
				{#if degree != null}
					<li>
						<a class="flex items-center" href={'/dash/' + degree} aria-label="Degree Dashboard">
							<IcRoundSchoolIcon class="w-6 h-6" />
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
				onclick={() => (showModal = true)}
			>
				<LucideFileHeartIcon class="w-6 h-6" />
				<span class="font-semibold tracking-wide">Dona i tuoi appunti</span>
			</button>
			<div class="modal" class:modal-open={showModal}>
				<div
					class="modal-box rounded-2xl bg-base-200/90 backdrop-blur max-w-2xl border border-base-300"
				>
					<div class="flex items-center gap-3">
						<LucideFileHeartIcon class="w-10 h-10 text-primary" />
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
									<AkarIconsGithubFillIcon class="w-6 h-6" />
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
								esistente e fai un <b>commit</b> con le tue modifiche.
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
								<MaterialSymbolsMenuBookIcon class="w-6 h-6" />
								<span>Vai alla Wiki</span>
							</a>
							<p>Hai bisogno di più informazioni? Leggi la wiki, in cui passo passo ti guidiamo.</p>
						</div>
						<div class="flex flex-col pt-10 md:pt-0 md:flex-row gap-2 items-start md:items-center">
							<a
								href="https://t.me/cartabinaria"
								class="btn rounded-xl btn-sm btn-accent gap-2 w-full md:w-max"
							>
								<PhTelegramLogoFillIcon class="w-6 h-6" />
								<span>Scrivici</span>
							</a>
							<p>
								Dubbi o domande? Entra nel nostro canale Telegram, c'è sempre qualcuno pronto ad
								aiutarti.
							</p>
						</div>
					</div>
					<div class="mt-4 alert border-info bg-info/20">
						<PhLightbulbFilamentBoldIcon class="w-5 h-5" />
						<span>Contribuire è gratuito e aiuta tutta la community. Grazie!</span>
					</div>
				</div>
				<div class="modal-backdrop" onclick={() => (showModal = false)}></div>
			</div>

			<a
				class="sm:ml-2 mx-2 p-1 flex items-center rounded-lg btn-ghost shrink-0 w-8"
				aria-label="GitHub Repository"
				href={editUrls.github_repo}
			>
				<AkarIconsGithubFillIcon class="w-6 h-6" />
			</a>
		</div>
	</div>
	<div class="flex flex-1 justify-end mr-2">
		{#if onfuzzy != null}
			<button
				title="Search"
				class="lg:ml-2 md:min-w-max p-2 bg-base-300 rounded-xl btn-ghost flex justify-center items-center gap-2"
				onclick={(e) => {
					e.preventDefault();
					onfuzzy(e);
				}}
			>
				<AkarIconsSearchIcon class="w-4 h-4 text-primary" />
				<span class="hidden md:inline h-max">
					<kbd class="kbd-sm">Ctrl</kbd>+
					<kbd class="kbd-sm">K</kbd>
				</span>
			</button>
		{/if}
	</div>
</div>
