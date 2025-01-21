<script lang="ts">
	import { EDIT_URLS } from '$lib/const';

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

<div class="navbar flex bg-base-200 shadow-sm px-5 {borderRadius}">
	<div class="sm:hidden flex justify-start items-center">
		<button class="sm:hidden flex btn btn-ghost btn-sm" onclick={() => mobileBreadcrumb()}>
			<span
				class="sm:hidden flex text-2xl items-center text-accent icon-[solar--folder-path-connect-bold-duotone]"
			>
			</span>
			<p class="text-accent" class:hidden={!breadcrumbMobile}>{title}</p>
		</button>
	</div>
	<div class="navbar min-h-0 p-0 justify-start items-center">
		<div
			class="breadcrumbs sm:flex lg:text-lg sm:items-start text-sm sm:flex-wrap font-semibold"
			class:hidden={breadcrumbMobile}
		>
			<ul>
				<li>
					<a class="ml-1 flex items-center" href="/" aria-label="Home">
						<span class="text-xl icon-[akar-icons--home-alt1]"></span>
					</a>
				</li>
				{#if degree != null}
					<li>
						<a class="flex items-center" href={'/dash/' + degree} aria-label="Degree Dashboard">
							<span class="text-xl icon-[ic--round-school]"></span>
						</a>
					</li>
				{/if}
				{#each urlParts as part}
					{@const href = getPartHref(path, part) + '?' + searchParams}
					<li><a {href} class="flex flex-wrap whitespace-normal">{part}</a></li>
				{/each}
			</ul>
		</div>
	</div>
	<div class="navbar-end">
		<div class="flex flex-1 justify-end">
			<a
				class="sm:ml-2 p-1 flex items-center rounded-lg btn-ghost flex-shrink-0 w-8"
				aria-label="GitHub Repository"
				href={editUrls.github_repo}
			>
				<span class="text-2xl icon-[akar-icons--github-fill]"></span>
			</a>
		</div>
	</div>
	<div class="flex flex-1 justify-end mr-2">
		{#if onfuzzy != null}
			<button
				title="Search"
				class="lg:ml-2 md:min-w-max p-2 bg-base-300 rounded-xl btn-ghost"
				onclick={(e) => {
					e.preventDefault();
					onfuzzy(e);
				}}
			>
				<span class="text-primary icon-[akar-icons--search] align-middle"></span>
				<span class="hidden md:inline">
					<kbd class="kbd-sm">Ctrl</kbd>+
					<kbd class="kbd-sm">K</kbd>
				</span>
			</button>
		{/if}
	</div>
</div>
