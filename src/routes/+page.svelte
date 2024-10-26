<script lang="ts">
	import { base } from '$app/paths';
	import type { Degree } from '$lib/teachings';
	import { setBannerClosed, shouldShowBanner } from '$lib/newsBanners';
	import { browser } from '$app/environment';

	export let data: {
		degrees: Degree[];
	};
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
				class="text-content hover:text-error focus:outline-none"
				on:click={() => setBannerClosed()}
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
		<div class="m-10">
			<h1 class="text-4xl font-semibold text-center">Risorse</h1>
			<h3 class="text-2 font-semibold text-center">
				Materiali di studio condivisi e creati da studenti per studenti, gestiti da <span
					class="underline"
					><a href="https://cartabinaria.students.cs.unibo.it">CartaBinaria</a></span
				>
			</h3>
		</div>
		<ul class="menu p-2 text-lg">
			{#each data.degrees as degree}
				{#if degree.teachings != null}
					{@render line(degree.name, `${base}/dash/${degree.id}`, degree.icon)}
				{:else}
					{@render line(degree.name, `${base}/${degree.id}`, degree.icon)}
				{/if}
			{/each}

			<div class="my-10"></div>

			{@render line('Impostazioni', `${base}/settings`, '🔧')}
			{@render line('Stato', `${base}/build`, '📊')}
		</ul>
	</div>
</div>
