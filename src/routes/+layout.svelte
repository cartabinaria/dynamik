<!--
SPDX-FileCopyrightText: 2023 - 2024 Alice Benatti <alice17bee@gmail.com>
SPDX-FileCopyrightText: 2023 - 2025 Eyad Issa <eyadlorenzo@gmail.com>
SPDX-FileCopyrightText: 2023 Xuanqiang Angelo Huang <huangelo02@gmail.com>
SPDX-FileCopyrightText: 2023 Luca Tagliavini <luca@teapot.ovh>

SPDX-License-Identifier: AGPL-3.0-or-later
-->

<script lang="ts">
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

	import '../app.css';
	import 'katex/dist/katex.css';
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

<SvelteToast />

<style>
</style>
