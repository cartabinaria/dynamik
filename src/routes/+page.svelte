<script lang="ts">
	import { base } from '$app/paths';
	import { browser } from '$app/environment';

	import type { Degree } from '$lib/teachings';
	import { setBannerClosed, shouldShowBanner } from '$lib/newsBanners';

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
	<div class="bg-info bg-opacity-50 text-content p-4">
		<div class="flex items-center justify-between">
			<div><!-- justifier --></div>
			<p class="font-semibold">
				<i><b>🔥Nuova feature: ToDo List🔥</b></i>
				All'interno di tutte le pagine con file cliccando sopra l'icona
				<span class="inline-flex items-baseline icon-[solar--file-bold-duotone]"></span>
				potrai segnarlo e salvarlo come "fatto"
				<span class="inline-flex items-baseline text-success icon-[solar--file-check-bold-duotone]"
				></span>, cancella i tuoi "ToDo" nella pagina corrente con
				<span class="inline-flex items-baseline text-warning icon-[solar--broom-bold-duotone]"
				></span>
			</p>
			<button
				class="text-content hover:text-error focus:outline-hidden"
				onclick={() => setBannerClosed()}
				aria-label="Chiudi banner"
			>
				<span class="text-xl icon-[akar-icons--x-small]"></span>
			</button>
		</div>
	</div>
{/if}

{#snippet line(name: string, href: string, icon: string)}
	<li>
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
			{#each data.degrees as degree}
				{#if degree.teachings != null}
					{@render line(degree.name, `${base}/dash/${degree.id}`, degree.icon)}
				{:else}
					{@render line(degree.name, `${base}/${degree.id}`, degree.icon)}
				{/if}
			{/each}

			<div class="divider"></div>

			<div class="grid grid-cols-2 gap-8">
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
		</div>
	</div>
</div>
