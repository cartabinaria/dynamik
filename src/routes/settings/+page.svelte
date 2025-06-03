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

	<div class="form-control my-4">
		<label class="label">
			<span class="label-text">Theme</span>
			<select class="select select-primary" bind:value={$settings.theme}>
				<option disabled selected>{$settings.theme}</option>
				{#each $themes as theme}
					<option>{theme}</option>
				{/each}
			</select>
		</label>
	</div>

	<div class="form-control my-4">
		<label class="cursor-pointer label">
			<span class="label-text">Open documents in new tabs</span>
			<input type="checkbox" class="toggle toggle-primary" bind:checked={$settings.newTab} />
		</label>
	</div>

	<div class="form-control my-4">
		<label class="cursor-pointer label">
			<span class="label-text">
				Display dates as
				<a href="https://en.wikipedia.org/wiki/ISO_8601" class="link">ISO8601</a>
			</span>
			<input type="checkbox" class="toggle toggle-primary" bind:checked={$settings.isoDates} />
		</label>
	</div>

	<div class="form-control my-4">
		<label class="label">
			<span class="label-text">Pick your favourite course to go straight to its dashboard</span>
			<select class="select select-primary w-min" bind:value={$settings.defaultCourse}>
				<option value={DEFAULT_COURSE_KEY}>- No preference - </option>
				{#each DEGREES as course}
					<option value={course.id}>{course.name}</option>
				{/each}
			</select>
		</label>
	</div>
</main>
