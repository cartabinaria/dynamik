<!--
SPDX-FileCopyrightText: 2023 - 2025 Alice Benatti <alice17bee@gmail.com>
SPDX-FileCopyrightText: 2023 - 2025 Eyad Issa <eyadlorenzo@gmail.com>
SPDX-FileCopyrightText: 2023 Xuanqiang Angelo Huang <huangelo02@gmail.com>
SPDX-FileCopyrightText: 2023 Luca Tagliavini <luca@teapot.ovh>
SPDX-FileCopyrightText: 2023 Stefano Volpe <stefano.volpe@student.uva.nl>
SPDX-FileCopyrightText: 2024 Samuele Musiani <samu@teapot.ovh>

SPDX-License-Identifier: AGPL-3.0-or-later
-->

<script lang="ts">
	import { base } from '$app/paths';
	import { browser } from '$app/environment';

	import type { Degree } from '$lib/teachings';
	import { setBannerClosed, shouldShowBanner } from '$lib/newsBanners';
	import CookieBanner from '$lib/components/CookieBanner.svelte';

	let { data }: { data: { degrees: Degree[] } } = $props();
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
	<!-- FEATURE BANNER -->
	<div class="fixed z-1 bg-info bg-opacity-30 text-content p-4 rounded-xl m-4">
		<div class="flex items-center justify-between">
			<div><!-- justifier --></div>
			<p class="font-semibold">
				<i><b>Nuova feature!</b></i>
				Ora puoi porre domande, rispondere e discutere su sezioni specifiche delle prove: clicca sulle
				bolle colorate per partecipare, votare le soluzioni migliori o segnalare contenuti inappropriati.
			</p>
			<button
				class="btn btn-ghost btn-circle btn-error focus:outline-hidden"
				onclick={() => setBannerClosed()}
				aria-label="I've read this, close it!"
				title="I've read this, close it!"
			>
				<span class="text-xl icon-[akar-icons--x-small]"></span>
			</button>
		</div>
	</div>
{/if}

{#snippet line(name: string, href: string, icon: string)}
	<li class="flex-auto">
		<a class="py-8 justify-center text-center border-base-content border-2 mb-4" {href}>
			{icon}
			{name}
			{icon}
		</a>
	</li>
{/snippet}

<div class="flex justify-center">
	<div class="container max-w-5xl">
		<div class="mt-10 mx-auto text-center">
			<h1 class="mb-4 text-4xl font-bold">Risorse</h1>
			<p>
				Materiali di studio condivisi e creati da studenti per studenti, gestiti da
				<span class="underline">
					<a href="https://cartabinaria.students.cs.unibo.it"> CartaBinaria </a>
				</span>
			</p>
		</div>
		<div class="divider"></div>

		<div class="prose sm:mx-auto mx-4">
			<p>
				Seleziona il tuo corso di laurea per accedere ai materiali di studio condivisi e creati da
				studenti per studenti.
			</p>
		</div>

		<ul class="menu p-2 text-lg mt-8 w-full">
			{#each data.degrees as degree (degree.id)}
				{#if degree.teachings != null}
					{@render line(degree.name, `${base}/dash/${degree.id}`, degree.icon)}
				{:else}
					{@render line(degree.name, `${base}/${degree.id}`, degree.icon)}
				{/if}
			{/each}

			<div class="divider"></div>

			<div class="flex justify-between flex-wrap gap-2 sm:gap-4">
				{@render line('FAQ', `${base}/faq`, '❓')}
				{@render line('Impostazioni', `${base}/settings`, '🔧')}
				{@render line('Stato', `${base}/build`, '📊')}
			</div>
		</ul>

		<div class="alert alert-warning md:mx-4 md:my-8 grow mx-2 sm:mx-auto" role="alert">
			<span class="icon-[ph--hand-palm-fill] text-4xl"></span>
			<div>
				<p class="block font-bold">
					<strong>Disclaimer</strong>
				</p>
				<p class="text-xs mb-2">
					Questo sito è stato pensato, creato e mantenuto da studenti.
					<strong>
						Non è in alcun modo ufficiale e non è affiliato con l'Università di Bologna.
					</strong>
				</p>
				<p class="text-xs">
					I materiali presenti sono stati creati da studenti e non sono verificati o approvati da
					docenti o dal dipartimento. Per segnalare errori, problemi o richieste di rimozione di
					materiale, contattaci su <a class="link" href="https://t.me/cartabinaria">Telegram.</a>
				</p>
			</div>
		</div>

		<div class="my-8">
			<p class="text-center">
				<a href="https://t.me/cartabinaria" class="btn btn-ghost">
					<span class="icon-[ph--telegram-logo-fill] text-2xl"></span>
					Contattaci su Telegram
				</a>
			</p>
			<CookieBanner></CookieBanner>
		</div>
	</div>
</div>
