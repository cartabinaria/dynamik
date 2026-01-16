<!--
SPDX-FileCopyrightText: 2026 Eyad Issa <eyadlorenzo@gmail.com>

SPDX-License-Identifier: AGPL-3.0-or-later
-->
<script lang="ts">
	import Navbar from '$lib/components/Navbar.svelte';
	import { RISORSE_BASE_URL } from '$lib/const';
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

	// Search functionality
	let searchQuery = $state('');

	let filteredTeachings = $derived.by(() => {
		const query = searchQuery.toLowerCase().trim();

		const queryFilter = (value: Teaching) =>
			value.name.toLowerCase().includes(query) ||
			value.professors?.some((prof) => prof.toLowerCase().includes(query));

		return data.teachings.filter(queryFilter);
	});

	let sortedTeachings = $derived(filteredTeachings.sort((a, b) => a.name.localeCompare(b.name)));
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

		<!-- Courses Table -->
		<div class="overflow-x-auto">
			<table class="table table-zebra w-full">
				<thead>
					<tr>
						<th>Code</th>
						<th>Course Name</th>
						<th>Degrees</th>
						<th>Professors</th>
						<th>Links</th>
					</tr>
				</thead>
				<tbody>
					{#each sortedTeachings as teaching (teaching.url)}
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
									href="{RISORSE_BASE_URL}/{teaching.url}"
									class="link link-primary font-medium truncate block max-w-md"
									target="_blank"
									rel="noopener noreferrer"
									title={teaching.name}
								>
									{teaching.name.length > 60 ? teaching.name.slice(0, 60) + '...' : teaching.name}
								</a>
							</td>
							<td>
								{#if degrees.length > 0}
									<div class="flex flex-wrap gap-1">
										{#each degrees as degree (degree.id)}
											<a
												href="/dash/{degree.id}"
												class="badge badge-soft badge-primary badge-sm"
												title={degree.name}
											>
												{degree.icon}
												{degree.name}
											</a>
										{/each}
									</div>
								{:else}
									<span class="text-sm text-base-content/50">-</span>
								{/if}
							</td>
							<td>
								{#if teaching.professors && teaching.professors.length > 0}
									<span class="text-sm">{teaching.professors.join(', ')}</span>
								{:else}
									<span class="text-sm text-base-content/50">-</span>
								{/if}
							</td>
							<td>
								<div class="flex gap-2">
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
											href="https://www.unibo.it/it/didattica/insegnamenti/insegnamento/{teaching.website}"
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
	</div>
</main>
