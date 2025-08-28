<script lang="ts">
	import '../app.css';
	import { onMount } from 'svelte';
	import settings from '$lib/settings';
	import { DEGREES } from '$lib/teachings';
	import { SvelteToast } from '@zerodevx/svelte-toast';
	import { checkAuth } from '$lib/stores/auth';

	onMount(() => {
		settings.subscribe(() => {
			document.firstElementChild!.setAttribute('data-theme', $settings.theme);
		});
		if (window.location.pathname === '/' && isKnownCourse($settings.defaultCourse)) {
			window.location.href = `/dash/${$settings.defaultCourse}`;
		}
    	checkAuth();
	});

	const isKnownCourse = (course: string) => {
		return DEGREES.some((c) => c.id === course);
	};

	import unibo32ico from '$lib/assets/unibo32.ico';
	import unibo128ico from '$lib/assets/unibo128.ico';
	import unibo180ico from '$lib/assets/unibo180.ico';
	import unibo192ico from '$lib/assets/unibo192.ico';

	import unibo128png from '$lib/assets/unibo128.png';
	import unibo180png from '$lib/assets/unibo180.png';
	import unibo192png from '$lib/assets/unibo192.png';
	import unibo512png from '$lib/assets/unibo512.png';

	import ogImage from '$lib/assets/risorse.students.cs.unibo.it-rect.png';
</script>

<svelte:head>
	<link rel="icon" href={unibo32ico} sizes="32x32" />
	<link rel="icon" href={unibo128ico} sizes="128x128" />
	<link rel="icon" href={unibo180ico} sizes="180x180" />
	<link rel="icon" href={unibo192ico} sizes="192x192" />

	<link rel="icon" href={unibo128png} sizes="128x128" />
	<link rel="icon" href={unibo180png} sizes="180x180" />
	<link rel="icon" href={unibo192png} sizes="192x192" />
	<link rel="icon" href={unibo512png} sizes="512x512" />

	<!-- OG preview settings -->
	<meta name="twitter:card" content="summary_large_image" />
	<meta name="twitter:image" property="og:image" content={ogImage} />
	<meta property="og:image" content={ogImage} />
	<meta property="og:site_name" content="Risorse CSUnibo" />
</svelte:head>

<slot />

<SvelteToast />

<style>
</style>
