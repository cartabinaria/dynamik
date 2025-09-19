<!-- 
SPDX-FileCopyrightText: 2025 Alice Benatti <alice17bee@gmail.com>
SPDX-FileCopyrightText: 2024 - 2025 Eyad Issa <eyadlorenzo@gmail.com>

SPDX-License-Identifier: AGPL-3.0-or-later
 -->

<script lang="ts">
	import { EDIT_URLS } from '$lib/const';
	import LoginButton from '$lib/components/LoginButton.svelte';

	type Props = {
		url: URL;
		degree?: string | null;
		onfuzzy?: (e: Event) => void;
		borderRadius?: string | null;
	};

	let { url, degree, onfuzzy, borderRadius = 'rounded-box' }: Props = $props();

	let path = $derived(url.pathname);
	let searchParams = $derived(url.searchParams);
	let editUrls = $derived(EDIT_URLS(url.pathname));

	// -- breadcrumbs --
	let breadcrumbMobile = $state(true);
	function mobileBreadcrumb() {
		breadcrumbMobile = !breadcrumbMobile;
	}

	function genTitle(parts: string[]) {
		if (parts.length === 0) return 'Risorse';
		const title = kebabToTitle(parts[0]);

		if (parts.length === 1) {
			return title;
		} else if (parts.length === 2) {
			return titleToAcronym(title) + ' > ' + kebabToTitle(parts[1]);
		} else {
			return titleToAcronym(title) + ' >...> ' + kebabToTitle(parts[parts.length - 1]);
		}
	}

	const getPartHref = (url: string, part: string) =>
		url
			.split('/')
			.slice(0, url.split('/').indexOf(part) + 1)
			.join('/');

	function kebabToTitle(str: string) {
		return str
			.split('-')
			.map((s) => s[0].toUpperCase() + s.slice(1))
			.join(' ');
	}

	function titleToAcronym(str: string) {
		return str
			.split(' ')
			.map((s) => s[0].toUpperCase())
			.join('');
	}

	let urlParts = $derived.by(() =>
		path
			.split('/')
			.slice(1)
			.filter((p) => p !== '')
	);

	let title = $derived(genTitle(urlParts));
</script>

<div class="navbar flex bg-base-200 shadow-xs px-0 sm:px-5 {borderRadius}">
	<!-- MOBILE -->
	<div class="sm:hidden flex justify-start items-center">
		<div class="dropdown w-max">
			<button
				type="button"
				class="btn btn-ghost flex gap-2 w-max"
				onclick={mobileBreadcrumb}
				aria-label="Open breadcrumb menu"
			>
				<span class="text-lg text-accent icon-[solar--folder-path-connect-bold-duotone]"></span>
				<p class="text-accent text-xs wrap-anywhere">{title}</p>
			</button>

			{#if !breadcrumbMobile}
				<ul tabindex="0" class="dropdown-content menu p-2 shadow bg-base-200 rounded-box w-56 z-50">
					<li>
						<a href="/" class="flex items-center"
							><span class="icon-[ic--round-home]"></span>
							Home
						</a>
					</li>
					{#if degree != null}
						<li>
							<a href={'/dash/' + degree} class="flex items-center">
								<span class="text-xl icon-[ic--round-school]"></span>
								{degree}
							</a>
						</li>
					{/if}
					{#each urlParts as part, i (i)}
						{@const href = getPartHref(path, part) + '?' + searchParams}
						<li><a {href}>{part}</a></li>
					{/each}
				</ul>
			{/if}
		</div>
	</div>
	<!-- DESKTOP  -->
	<div class="navbar min-h-0 p-0 justify-start items-center gap-2">
		<div
			class="breadcrumbs hidden sm:flex lg:text-lg sm:items-center text-sm font-semibold"
		>
			<ul class="flex flex-wrap">
				<li>
					<a class="ml-1 flex items-center" href="/" aria-label="Home">
						<span class="icon-[ic--round-home] text-lg"></span>
					</a>
				</li>
				{#if degree != null}
					<li>
						<a class="flex items-center" href={'/dash/' + degree} aria-label="Degree Dashboard">
							<span class="text-xl icon-[ic--round-school]"></span>
						</a>
					</li>
				{/if}
				{#each urlParts as part, i (i)}
					{@const href = getPartHref(path, part) + '?' + searchParams}
					<li><a {href} class="flex flex-wrap whitespace-normal">{part}</a></li>
				{/each}
			</ul>
		</div>
		<a
			class="hidden sm:inline flex items-center rounded-lg btn-ghost shrink-0 w-8"
			href={editUrls.github_repo}
			title="Open GitHub Repository {urlParts[0]}"
			aria-label="Open GitHub Repository {urlParts[0]}"
		>
			<span class="text-2xl icon-[akar-icons--github-fill] hover:text-primary"></span>
		</a>
	</div>
	<div class="navbar-end gap-1 sm:gap-2">
		<div class="flex flex-1 justify-end">
			{#if onfuzzy != null}
				<button
					title="Search"
					class="lg:ml-2 md:min-w-max p-2 bg-base-300 rounded-xl btn-ghost cursor-pointer"
					onclick={(e) => {
						e.preventDefault();
						onfuzzy(e);
					}}
				>
					<span class="text-primary icon-[akar-icons--search] align-middle"></span>
					<span class="hidden md:inline">
						<kbd class="kbd kbd-sm">Ctrl</kbd>
						+
						<kbd class="kbd kbd-sm">K</kbd>
					</span>
				</button>
			{/if}
		</div>
		<LoginButton {url} />
	</div>
</div>
