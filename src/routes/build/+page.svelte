<script lang="ts">
	import type { PageData } from './$types';
	import { teachingsFilter } from '$lib/teachings';
	import { MAX_YEARS_FOR_DEGREE } from '$lib/const';

	const WORKFLOW_NAMES = ['filenames', 'build-and-deploy'];
	const WORKFLOW_URL = (project: string, workflow: string) =>
		`https://github.com/cartabinaria/${project}/actions/workflows/${workflow}.yaml`;

	let { data }: { data: PageData } = $props();
</script>

<main class="md:container md:m-auto p-4">
	<nav class="navbar flex bg-base-200 text-neutral-content rounded-box shadow-sm px-5 mb-5">
		<div class="navbar-start">
			<h1 class="text-xl font-semibold text-base-content">Stato delle raccolte</h1>
		</div>
		<div class="navbar-end flex items-center">
			<a class="btn btn-square btn-ghost" title="Indietro" href="/" aria-label="Indietro">
				<span class="text-primary icon-[akar-icons--arrow-back-thick-fill]"></span>
			</a>
		</div>
	</nav>
	<div class="m-8">
		{#each data.degrees as degree, i}
			{#if i > 0}
				<hr class="my-8 border-primary" />
			{/if}
			<h2 class="text-center text-2xl">{degree.name}</h2>
			{#if degree.teachings != null}
				{#each [...Array(MAX_YEARS_FOR_DEGREE).keys()].map((i) => i + 1) as year}
					<h3 class="text-center text-xl font-bold my-4">{year}</h3>
					<div class="grid grid-cols-4 gap-4">
						{#each teachingsFilter(degree, year) as teaching}
							<div>
								<h4 class="font-bold">{teaching}</h4>
								{#if data.activeTeachings[i].includes(teaching)}
									<div class="flex gap-2">
										{#each WORKFLOW_NAMES as workflow}
											{@const url = data.teachings.get(teaching)?.url}
											{#if url != null}
												{@const href = WORKFLOW_URL(url, workflow)}
												{@const src = `${href}/badge.svg`}
												<a {href}>
													<img {src} alt="Not found" />
												</a>
											{/if}
										{/each}
									</div>
								{/if}
							</div>
						{/each}
					</div>
				{/each}
			{/if}
		{/each}
	</div>
</main>
