<!--
SPDX-FileCopyrightText: 2023 - 2025 Alice Benatti <alice17bee@gmail.com>
SPDX-FileCopyrightText: 2023 - 2026 Eyad Issa <eyadlorenzo@gmail.com>
SPDX-FileCopyrightText: 2023 Xuanqiang Angelo Huang <huangelo02@gmail.com>
SPDX-FileCopyrightText: 2023 Luca Tagliavini <luca@teapot.ovh>
SPDX-FileCopyrightText: 2023 Stefano Volpe <stefano.volpe@student.uva.nl>
SPDX-FileCopyrightText: 2024 Samuele Musiani <samu@teapot.ovh>

SPDX-License-Identifier: AGPL-3.0-or-later
-->

<script lang="ts">
	import { resolve } from '$app/paths';
	import { browser } from '$app/environment';

	import type { Degree } from '$lib/teachings';
	import { setBannerClosed, shouldShowBanner } from '$lib/newsBanners';

	import IconAkarIconsXSmall from '@iconify-svelte/akar-icons/x-small';
	import IconPhHandPalmFill from '@iconify-svelte/ph/hand-palm-fill';
	import IconPhTelegramLogoFill from '@iconify-svelte/ph/telegram-logo-fill';
	import IconLucideChevronRight from '@iconify-svelte/lucide/chevron-right';

	let { data }: { data: { degrees: Degree[] } } = $props();

	let degreeAggregates: Record<string, string[]> = {
		informatica: ['informatica', 'informatica-per-il-management', 'informatica-magistrale'],
		ingegneria: ['ingegneria', 'ingegneria-informatica-magistrale', 'artificial-intelligence'],
		cesena: ['ingegneria-e-scienze-informatiche-magistrale'],
		fisica: ['fisica'],
		altro: ['lab']
	};

	function checkDegreeCategory(data: { degrees: Degree[] }, category: string): Degree[] {
		return data.degrees.filter((degree) => degreeAggregates[category]?.includes(degree.id));
	}
</script>

<svelte:head>
	<title>Risorse CartaBinaria</title>
	<!-- OG meta graph -->
	<meta name="title" property="og:title" content="Dashboard" />
	<meta
		name="description"
		property="og:description"
		content="Risorse per gli studenti dei corsi di laurea del dipartimento di informatica (DISI) dell'Università di Bologna"
	/>
</svelte:head>

{#if $shouldShowBanner && browser}
	<div class="flex justify-center">
		<!-- FEATURE BANNER -->
		<div class="fixed z-1 bg-info bg-opacity-30 text-content p-4 rounded-xl m-4">
			<div class="flex items-center justify-between">
				<div><!-- justifier --></div>
				<p class="font-semibold">
					<i><b>🔥Nuova feature: ToDo List🔥</b></i>
					All'interno di tutte le pagine con file cliccando sopra l'icona potrai segnarlo e salvarlo come
					"fatto"!
				</p>
				<button
					class="btn btn-ghost btn-circle btn-error focus:outline-hidden"
					onclick={() => setBannerClosed()}
					aria-label="I've read this, close it!"
					title="I've read this, close it!"
				>
					<IconAkarIconsXSmall class="w-5 h-5" />
				</button>
			</div>
		</div>
	</div>
{/if}

{#snippet line(name: string, href: string, icon: string, tools?: boolean)}
	<li>
		<a
			class={[
				'flex items-center gap-3 rounded-field px-3 py-2.5 font-semibold transition-colors hover:bg-base-300',
				tools && 'bg-base-200'
			]}
			{href}
		>
			<span class="grid size-10 shrink-0 place-items-center rounded-field bg-base-100 text-2xl">
				{icon}
			</span>
			<span class="grow">{name}</span>
			<IconLucideChevronRight class="size-4 shrink-0 opacity-60" />
		</a>
	</li>
{/snippet}

<main class="mx-auto max-w-5xl px-4 pb-10">
	<header class="mt-12 mb-8 text-center">
		<p class="text-sm font-semibold tracking-widest text-primary uppercase">CartaBinaria</p>
		<h1 class="mt-2 text-4xl font-bold sm:text-5xl">Risorse</h1>
		<p class="mx-auto mt-4 max-w-2xl text-lg">
			Materiali di studio condivisi e creati da studenti per studenti, gestiti da
			<a class="link" href="https://cartabinaria.students.cs.unibo.it">CartaBinaria</a>
		</p>
		<p class="mx-auto mt-2 max-w-2xl opacity-80">
			Seleziona il tuo corso di laurea per accedere ai materiali di studio condivisi e creati da
			studenti per studenti.
		</p>
	</header>

	<nav aria-label="Corsi di laurea" class="grid gap-4 sm:grid-cols-2">
		{#each Object.keys(degreeAggregates) as category (category)}
			{#if checkDegreeCategory(data, category).length > 0}
				<ul class="rounded-box border border-base-300 bg-base-200 p-2">
					{#each checkDegreeCategory(data, category) as degree (degree.id)}
						{#if degree.teachings != null}
							{@render line(
								degree.name,
								resolve('/dash/[course]', { course: degree.id }),
								degree.icon
							)}
						{:else}
							{@render line(degree.name, resolve('/[...dir]', { dir: degree.id }), degree.icon)}
						{/if}
					{/each}
				</ul>
			{/if}
		{/each}
	</nav>

	<ul class="mt-4 grid gap-4 sm:grid-cols-3">
		{@render line('Tutti i Corsi', resolve('/courses'), '📚', true)}
		{@render line('Impostazioni', resolve('/settings'), '🔧', true)}
		{@render line('Stato', resolve('/build'), '📊', true)}
	</ul>

	<div
		class="mt-8 flex items-start gap-4 rounded-box border border-warning/50 bg-warning/10 p-4 text-sm"
		role="alert"
	>
		<IconPhHandPalmFill class="size-8 shrink-0 text-warning" />
		<div>
			<p class="mb-1 font-bold">Disclaimer</p>
			<p class="mb-2">
				Questo sito è stato pensato, creato e mantenuto da studenti.
				<strong>
					Non è in alcun modo ufficiale e non è affiliato con l'Università di Bologna.
				</strong>
			</p>
			<p>
				I materiali presenti sono stati caricati da studenti e non sono verificati o approvati da
				docenti o dal dipartimento. Per segnalare errori, problemi o richieste di rimozione di
				materiale, contattaci su <a class="link" href="https://t.me/cartabinaria">Telegram.</a>
			</p>
		</div>
	</div>

	<p class="mt-8 text-center">
		<a href="https://t.me/cartabinaria" class="btn btn-primary">
			<IconPhTelegramLogoFill class="size-6" />
			Contattaci su Telegram
		</a>
	</p>
</main>
