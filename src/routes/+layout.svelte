<script lang="ts">
	import '../app.css';
	import { onMount } from 'svelte';
	import settings from '$lib/settings';
	import { DEGREES } from '$lib/teachings';

	onMount(() => {
		settings.subscribe(() => {
			document.firstElementChild!.setAttribute('data-theme', $settings.theme);
		});
		if (window.location.pathname === '/' && isKnownCourse($settings.defaultCourse)) {
			window.location.href = `/dash/${$settings.defaultCourse}`;
		}
	});

	const isKnownCourse = (course: string) => {
		return DEGREES.some((c) => c.id === course);
	};

	import favicon from '$lib/assets/cartabinaria.png';
	import ogImage from '$lib/assets/cartabinaria-opengraph.png';
</script>

<svelte:head>
	<link rel="icon" href={favicon} />

	<!-- OG preview settings -->
	<meta name="twitter:card" content="summary_large_image" />
	<meta name="twitter:image" property="og:image" content={ogImage} />
	<meta property="og:image" content={ogImage} />
	<meta property="og:site_name" content="Risorse CartaBinaria" />
</svelte:head>

<slot />

<style>
</style>
