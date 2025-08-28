<!--
SPDX-FileCopyrightText: 2023 - 2025 Eyad Issa <eyadlorenzo@gmail.com>
SPDX-FileCopyrightText: 2023 Alice Benatti <alice17bee@gmail.com>
SPDX-FileCopyrightText: 2023 Xuanqiang Angelo Huang <huangelo02@gmail.com>
SPDX-FileCopyrightText: 2023 Luca Tagliavini <luca@teapot.ovh>

SPDX-License-Identifier: AGPL-3.0-or-later
-->

<script lang="ts">
	import { derived } from 'svelte/store';
	import settings, { themes as allThemes, DEFAULT_COURSE_KEY } from '$lib/settings';
	import { DEGREES } from '$lib/teachings';

	let themes = derived(settings, ({ theme }) => allThemes.filter((t) => t != theme));
</script>

<main class="md:container md:m-auto p-4">
	<nav class="navbar flex bg-base-200 text-neutral-content rounded-box shadow-xs px-5 mb-5">
		<div class="navbar-start">
			<h1 class="text-xl font-semibold text-base-content">Impostazioni</h1>
		</div>
		<div class="navbar-end flex items-center">
			<a href="/" class="btn btn-square btn-ghost" title="Indietro" aria-label="Indietro">
				<span class="text-primary icon-[akar-icons--arrow-back-thick-fill]"></span>
			</a>
		</div>
	</nav>

	<div class="max-w-xl mx-auto bg-base-100 rounded-xl shadow-md p-6">
		<!-- Settings Grid -->
		<div class="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6 items-center">
			<!-- Theme Selection -->
			<label for="theme-select" class="label-text font-medium">Theme</label>
			<select id="theme-select" class="select select-primary w-full" bind:value={$settings.theme}>
				<option disabled selected>{$settings.theme}</option>
				{#each $themes as theme (theme)}
					<option>{theme}</option>
				{/each}
			</select>

			<!-- Open in new tab -->
			<label for="newtab-toggle" class="label-text font-medium">Open documents in new tabs</label>
			<input
				id="newtab-toggle"
				type="checkbox"
				class="toggle toggle-primary"
				bind:checked={$settings.newTab}
			/>

			<!-- ISO Dates -->
			<label for="iso-toggle" class="label-text font-medium flex items-center gap-2">
				Display dates as
				<a
					href="https://en.wikipedia.org/wiki/ISO_8601"
					class="link link-primary underline"
					target="_blank"
					rel="noopener noreferrer">ISO8601</a
				>
			</label>
			<input
				id="iso-toggle"
				type="checkbox"
				class="toggle toggle-primary"
				bind:checked={$settings.isoDates}
			/>

			<!-- Default Course -->
			<label for="default-course-select" class="label-text font-medium">
				Pick your favourite course to go straight to its dashboard
			</label>
			<select
				id="default-course-select"
				class="select select-primary w-full"
				bind:value={$settings.defaultCourse}
			>
				<option value={DEFAULT_COURSE_KEY}>- No preference - </option>
				{#each DEGREES as course (course.id)}
					<option value={course.id}>{course.name}</option>
				{/each}
			</select>
		</div>
	</div>
</main>
