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
	<li class="flex-auto">
		<a
			class={[
				'flex justify-center items-center p-4 rounded-lg hover:shadow-lg hover:bg-accent/80 transition w-full duration-300 ease-in-out',
				tools && 'bg-base-200'
			]}
			{href}
		>
			<span class="text-3xl mb-2">{icon}</span>
			<span class="font-semibold text-center">{name}</span>
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

		<ul class="menu p-2 text-lg w-full mt-2">
			<div class="grid gap-6 sm:grid-cols-2">
				{#each Object.keys(degreeAggregates) as category (category)}
					{#if checkDegreeCategory(data, category).length > 0}
						<div class="p-4 hover:shadow-lg transition bg-base-200 rounded-2xl">
							<!-- Corsi della categoria -->
							<div class="grid gap-2">
								{#each checkDegreeCategory(data, category) as degree (degree.id)}
									{#if degree.teachings != null}
										{@render line(
											degree.name,
											resolve('/dash/[course]', { course: degree.id }),
											degree.icon
										)}
									{:else}
										{@render line(
											degree.name,
											resolve('/[...dir]', { dir: degree.id }),
											degree.icon
										)}
									{/if}
								{/each}
							</div>
						</div>
					{/if}
				{/each}
			</div>

			<div class="divider"></div>

			<div class="flex justify-between flex-wrap gap-2 sm:gap-4">
				{@render line('Tutti i Corsi', resolve('/courses'), '📚', true)}
				{@render line('Impostazioni', resolve('/settings'), '🔧', true)}
				{@render line('Stato', resolve('/build'), '📊', true)}
			</div>
		</ul>

		<div class="alert alert-warning md:mx-4 md:my-8 grow mx-2 sm:mx-auto rounded-xl" role="alert">
			<IconPhHandPalmFill class="w-10 h-10" />
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
					I materiali presenti sono stati caricati da studenti e non sono verificati o approvati da
					docenti o dal dipartimento. Per segnalare errori, problemi o richieste di rimozione di
					materiale, contattaci su <a class="link" href="https://t.me/cartabinaria">Telegram.</a>
				</p>
			</div>
		</div>

		<div class="my-8">
			<p class="text-center">
				<a href="https://t.me/cartabinaria" class="btn btn-ghost rounded-xl">
					<IconPhTelegramLogoFill class="w-6 h-6 mr-2" />

					Contattaci su Telegram
				</a>
			</p>
		</div>
	</div>
</div>
