<!--
SPDX-FileCopyrightText: 2026 Eyad Issa <eyadlorenzo@gmail.com>

SPDX-License-Identifier: AGPL-3.0-or-later
-->
<script lang="ts">
	import { resolve } from '$app/paths';
	import Navbar from '$lib/components/Navbar.svelte';
	import type { Teaching } from '$lib/teachings';
	import { DEGREES } from '$lib/teachings';

	import IconMdiCogOutline from '@iconify-svelte/mdi/cog-outline';
	import IconMdiGraduationCap from '@iconify-svelte/mdi/graduation-cap';

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
		<div
			class="mb-3 mx-auto max-w-4xl sticky top-2 z-10 card bg-base-200 border-2 border-primary shadow-md"
		>
			<div class="card-body p-4">
				<input
					type="text"
					placeholder="Search courses or professors..."
					class="input input-bordered w-full"
					bind:value={searchQuery}
				/>
			</div>
		</div>
		<p class="text-sm text-base-content/70 my-3 text-center">
			Showing {filteredTeachings.length} of {data.teachings.length} courses
		</p>

		<!-- Courses Table - Desktop View -->
		<div class="hidden md:block overflow-x-auto container mx-auto">
			<table class="table table-zebra w-full">
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
									class="font-semibold wrap-break-word link link-primary link-hover"
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
													class="badge badge-outline badge-sm p-3 rounded-full whitespace-nowrap"
													title={degree.name}
												>
													{degree.icon}
													{degree.name}
												</a>
											{/each}
										</div>
										<!-- Simple text on medium screens -->
										<div class="lg:hidden text-sm">
											{degrees.map((d) => d.name).join(', ')}
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
												class="badge badge-sm p-3 rounded-full"
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
								<div class="flex gap-2 justify-end">
									<a
										href={resolve('/[...dir]', { dir: teaching.url })}
										class="btn btn-xs btn-accent"
									>
										Details
									</a>
									<a
										href={teaching.chat ? `https://${teaching.chat}` : '#'}
										class={['btn btn-xs btn-primary', teaching.chat == null && 'btn-disabled']}
										target="_blank"
										title={teaching.chat == null ? 'No chat available' : 'Course Chat'}
										rel="noopener noreferrer"
									>
										Chat
									</a>
									<a
										href={teaching.website ? teachingCodeToUrl(teaching.website) : '#'}
										class={['btn btn-xs btn-secondary', teaching.website == null && 'btn-disabled']}
										title={teaching.website == null
											? 'No university page available'
											: 'University Page'}
										target="_blank"
										rel="noopener noreferrer"
									>
										University Page
									</a>
								</div>
							</td>
						</tr>
					{/each}
				</tbody>
			</table>
		</div>

		<!-- Courses Cards - Mobile View -->
		<div class="md:hidden grid gap-4 p-2">
			{#each filteredTeachings as teaching (teaching.url)}
				{@const degrees = getDegreesForCourse(teaching.url)}

				<div class="card bg-base-200 overflow-x-hidden text-base-content">
					<div class="card-body p-6">
						<div class="flex justify-between items-start gap-4 mb-4">
							<h2 class="card-title text-primary text-xl font-bold leading-tight">
								<a href={resolve('/[...dir]', { dir: teaching.url })} class="hover:brightness-110">
									{teaching.name}
								</a>
							</h2>
							{#if teaching.website}
								<div
									class="bg-slate-700/50 text-slate-400 text-[10px] font-mono px-2 py-1 rounded uppercase text-nowrap"
								>
									Code: {teaching.website}
								</div>
							{/if}
						</div>

						{#if degrees.length > 0}
							<div class="flex items-start gap-3">
								<IconMdiCogOutline class="text-slate-400 w-6 h-6 shrink-0 mt-1" />
								<div class="flex flex-wrap gap-2 w-full">
									{#each degrees as degree (degree.id)}
										<a
											href={resolve('/dash/[course]', { course: degree.id })}
											class="badge badge-outline p-3 rounded-full h-auto py-1"
										>
											{degree.icon}
											<span class="ml-1">
												{degree.name}
											</span>
										</a>
									{/each}
								</div>
							</div>
						{/if}

						{#if teaching.professors != null && teaching.professors.length > 0}
							<div class="flex items-center gap-3 mt-1">
								<IconMdiGraduationCap class="text-slate-400 w-6 h-6 shrink-0" />
								<div class="flex flex-wrap gap-2">
									{#each teaching.professors as prof (prof)}
										<a
											href={professorToUrl(prof)}
											class="badge p-3 rounded-full whitespace-nowrap text-ellipsis"
											target="_blank"
										>
											{prof}
										</a>
									{/each}
								</div>
							</div>
						{/if}

						<div class="grid grid-cols-3 gap-3 pt-2 mt-6">
							<a
								href={resolve('/[...dir]', { dir: teaching.url })}
								class="btn btn-accent btn-sm h-10"
							>
								Details
							</a>

							<a
								href={teaching.chat ? `https://${teaching.chat}` : '#'}
								class={[
									'btn btn-primary btn-sm h-10',
									teaching.chat == null && 'btn-disabled opacity-30'
								]}
								target="_blank"
							>
								Chat
							</a>

							<a
								href={teaching.website ? teachingCodeToUrl(teaching.website) : '#'}
								class={[
									'btn btn-secondary btn-sm h-10',
									teaching.website == null && 'btn-disabled opacity-30'
								]}
								target="_blank"
							>
								University Page
							</a>
						</div>
					</div>
				</div>
			{/each}
		</div>
	</div>
</main>
