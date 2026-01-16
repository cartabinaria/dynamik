<!--
SPDX-FileCopyrightText: 2026 Eyad Issa <eyadlorenzo@gmail.com>

SPDX-License-Identifier: AGPL-3.0-or-later
-->
<script lang="ts">
	import { resolve } from '$app/paths';
	import Navbar from '$lib/components/Navbar.svelte';
	import type { Teaching } from '$lib/teachings';
	import { DEGREES } from '$lib/teachings';

	import type { PageProps } from './$types';

	let { data }: PageProps = $props();

	// Function to find which degrees include a specific course
	function getDegreesForCourse(courseUrl: string) {
		return DEGREES.filter((degree) =>
			degree.teachings?.some((teaching) => teaching.name === courseUrl)
		);
	}

	let sortedTeachings = $derived(data.teachings.sort((a, b) => a.name.localeCompare(b.name)));

	// Search functionality
	let searchQuery = $state('');

	let filteredTeachings = $derived.by(() => {
		const query = searchQuery.toLowerCase().trim();

		const queryFilter = (value: Teaching) =>
			value.name.toLowerCase().includes(query) ||
			value.professors?.some((prof) => prof.toLowerCase().includes(query));

		return sortedTeachings.filter(queryFilter);
	});

	const teachingCodeToUrl = (code: string) => {
		return `https://www.unibo.it/it/didattica/insegnamenti/insegnamento/${code}`;
	};

	const professorToUrl = (prof: string) => {
		return `https://www.unibo.it/sitoweb/${prof}`;
	};
</script>

<main class="max-w-7xl p-4 mx-auto">
	<Navbar title="All Courses"></Navbar>

	<div class="mt-6">
		<!-- Search Bar -->
		<div class="mb-6 mx-auto max-w-4xl">
			<input
				type="text"
				placeholder="Search courses or professors..."
				class="input input-bordered w-full"
				bind:value={searchQuery}
			/>
			<p class="text-sm text-base-content/70 mt-2 text-center">
				Showing {filteredTeachings.length} of {data.teachings.length} courses
			</p>
		</div>

		<!-- Courses Table - Desktop View -->
		<div class="hidden md:block overflow-x-auto">
			<table class="table table-zebra w-full table-fixed">
				<thead>
					<tr>
						<th class="w-20">Code</th>
						<th class="w-1/4">Course Name</th>
						<th class="w-1/4">Degrees</th>
						<th class="w-1/5">Professors</th>
						<th class="w-28 text-right">Links</th>
					</tr>
				</thead>
				<tbody>
					{#each filteredTeachings as teaching (teaching.url)}
						{@const degrees = getDegreesForCourse(teaching.url)}
						<tr>
							<td>
								{#if teaching.website}
									<span class="text-sm font-mono">{teaching.website}</span>
								{:else}
									<span class="text-sm text-base-content/50">-</span>
								{/if}
							</td>
							<td>
								<a
									href={resolve('/[...dir]', { dir: teaching.url })}
									class="link link-primary font-medium break-words"
									rel="noopener noreferrer"
									title={teaching.name}
								>
									{teaching.name}
								</a>
							</td>
							<td>
								<div class="max-w-full overflow-hidden">
									{#if degrees.length > 0}
										<!-- Badges on larger screens -->
										<div class="hidden lg:flex flex-wrap gap-1">
											{#each degrees as degree (degree.id)}
												<a
													href={resolve('/dash/[course]', { course: degree.id })}
													class="badge badge-soft badge-primary badge-sm whitespace-nowrap"
													title={degree.name}
												>
													{degree.icon}
													{degree.name}
												</a>
											{/each}
										</div>
										<!-- Simple text on medium screens -->
										<div class="lg:hidden text-sm">
											{degrees.map((d) => `${d.icon} ${d.name}`).join(', ')}
										</div>
									{:else}
										<span class="text-sm text-base-content/50">-</span>
									{/if}
								</div>
							</td>
							<td>
								{#if teaching.professors && teaching.professors.length > 0}
									<div class="flex flex-wrap gap-1">
										{#each teaching.professors as prof (prof)}
											<a
												href={professorToUrl(prof)}
												class="badge badge-soft badge-sm"
												target="_blank"
											>
												{prof}
											</a>
										{/each}
									</div>
								{:else}
									<span class="text-sm text-base-content/50">-</span>
								{/if}
							</td>
							<td>
								<div class="flex gap-2 flex-wrap justify-end">
									{#if teaching.chat}
										<a
											href="https://{teaching.chat}"
											class="btn btn-xs btn-primary"
											target="_blank"
											rel="noopener noreferrer"
										>
											Chat
										</a>
									{/if}
									{#if teaching.website}
										<a
											href={teachingCodeToUrl(teaching.website)}
											class="btn btn-xs btn-secondary"
											target="_blank"
											rel="noopener noreferrer"
										>
											Website
										</a>
									{/if}
								</div>
							</td>
						</tr>
					{/each}
				</tbody>
			</table>
		</div>

		<!-- Courses Cards - Mobile View -->
		<div class="md:hidden grid gap-4">
			{#each filteredTeachings as teaching (teaching.url)}
				{@const degrees = getDegreesForCourse(teaching.url)}
				<div class="card bg-base-200 shadow-md">
					<div class="card-body p-4">
						<!-- Course Name -->
						<h2 class="card-title text-base mb-2">
							<a
								href={resolve('/[...dir]', { dir: teaching.url })}
								class="link link-primary"
								rel="noopener noreferrer"
							>
								{teaching.name}
							</a>
						</h2>

						<!-- Code -->
						{#if teaching.website}
							<div class="flex items-center gap-2 text-sm mb-2">
								<span class="font-semibold">Code:</span>
								<span class="font-mono">{teaching.website}</span>
							</div>
						{/if}

						<!-- Degrees -->
						{#if degrees.length > 0}
							<div class="mb-2">
								<span class="text-sm font-semibold">Degrees:</span>
								<div class="flex flex-wrap gap-1 mt-1">
									{#each degrees as degree (degree.id)}
										<a
											href={resolve('/dash/[course]', { course: degree.id })}
											class="badge badge-soft badge-primary"
											title={degree.name}
										>
											{degree.icon}
											{degree.name}
										</a>
									{/each}
								</div>
							</div>
						{/if}

						<!-- Professors -->
						{#if teaching.professors && teaching.professors.length > 0}
							<div class="mb-2">
								<span class="text-sm font-semibold">Professors:</span>
								<p class="text-sm text-base-content/70">
									{#each teaching.professors as prof (prof)}
										<a href={professorToUrl(prof)} class="badge badge-soft" target="_blank">
											{prof}
										</a>
									{/each}
								</p>
							</div>
						{/if}

						<!-- Links -->
						<div class="card-actions justify-end mt-2">
							{#if teaching.chat}
								<a
									href="https://{teaching.chat}"
									class="btn btn-xs btn-primary"
									target="_blank"
									rel="noopener noreferrer"
								>
									Chat
								</a>
							{/if}
							{#if teaching.website}
								<a
									href={teachingCodeToUrl(teaching.website)}
									class="btn btn-xs btn-secondary"
									target="_blank"
									rel="noopener noreferrer"
								>
									Website
								</a>
							{/if}
						</div>
					</div>
				</div>
			{/each}
		</div>
	</div>
</main>
