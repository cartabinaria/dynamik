<!--
SPDX-FileCopyrightText: 2023 - 2024 Alice Benatti <alice17bee@gmail.com>
SPDX-FileCopyrightText: 2023 - 2025 Stefano Volpe <stefano.volpe@student.uva.nl>
SPDX-FileCopyrightText: 2023 - 2025 Eyad Issa <eyadlorenzo@gmail.com>
SPDX-FileCopyrightText: 2023 Luca Tagliavini <luca.tagliavini5@studio.unibo.it>
SPDX-FileCopyrightText: 2023 kocierik <kocierik@gmail.com>
SPDX-FileCopyrightText: 2024 Samuele Musiani <samu@teapot.ovh>

SPDX-License-Identifier: AGPL-3.0-or-later
-->

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
	<nav class="navbar flex bg-base-200 rounded-box shadow-xs px-5 mb-5">
		<div class="navbar-start">
			<div class="navbar-start flex items-center">
				<a href="/" class="btn btn-ghost btn-primary rounded-lg" title="Home" aria-label="Home">
					<span class="icon-[ic--round-home]"></span>
					Home
				</a>
			</div>
			<div class="navbar-center">
				<h1 class="text-xl font-semibold text-base-content">Stato delle raccolte</h1>
			</div>
			<div class="navbar-end flex items-center">
				<a class="btn btn-square btn-ghost" title="Indietro" href="/" aria-label="Indietro">
					<span class="text-primary icon-[akar-icons--arrow-back-thick-fill]"></span>
				</a>
			</div>
		</div>
	</nav>
	<div class="m-8">
		{#each data.degrees as degree, degreeIndex (degree.id)}
			{#if degree.teachings != null}
				{#if degreeIndex > 0}
					<hr class="my-8 border-primary" />
				{/if}
				<h2 class="text-center text-2xl">{degree.name}</h2>
				{#each [...Array(MAX_YEARS_FOR_DEGREE).keys()].map((i) => i + 1).concat([0]) as year (year)}
					{@const teachings = teachingsFilter(degree, year)}
					{#if teachings.length > 0}
						<h3 class="text-center text-xl font-bold my-4">{year || 'Senza anno'}</h3>
						<div class="grid grid-cols-4 gap-4">
							{#each teachings as teaching, teachingIndex (teachingIndex)}
								<div>
									<h4 class="font-bold">{teaching}</h4>
									{#if data.activeTeachings[degreeIndex].includes(teaching)}
										<div class="flex gap-2">
											{#each WORKFLOW_NAMES as workflow, workflowIndex (workflowIndex)}
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
					{/if}
				{/each}
			{/if}
		{/each}
	</div>
</main>
