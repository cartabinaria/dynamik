<!-- 
SPDX-FileCopyrightText: 2025 Alice Benatti <alice17bee@gmail.com>

SPDX-License-Identifier: AGPL-3.0-or-later
-->
<script lang="ts">
	import { AUTH_BASE_URL, POLLEG_BASE_URL } from '$lib/const';
	import { onMount } from 'svelte';

	const backends = [POLLEG_BASE_URL, AUTH_BASE_URL];

	let showBanner = $state(false);
	let status = $state<Record<string, boolean>>({});
	let iframes: HTMLIFrameElement[] = $state([]);
	let isLoading = $state(true);

	// Auto-hide banner quando tutti i domini sono abilitati
	$effect(() => {
		const allEnabled = backends.every((domain) => status[domain] === true);
		if (allEnabled && Object.keys(status).length === backends.length) {
			showBanner = false;
		}
	});

	onMount(() => {
		// Controlla se mostrare il banner
		const hasStorageAccessSupport = 'hasStorageAccess' in document;
		const isFirefox = navigator.userAgent.toLowerCase().includes('firefox');

		if (!hasStorageAccessSupport || !isFirefox) {
			showBanner = false;
			isLoading = false;
			return;
		}

		// Inizializza status
		backends.forEach((domain) => {
			status[domain] = false;
		});

		// Timeout per iframe che non rispondono
		const timeoutId = setTimeout(() => {
			backends.forEach((domain) => {
				if (!(domain in status)) {
					status[domain] = false;
				}
			});

			// Se almeno un dominio non ha accesso, mostra banner
			const needsAccess = Object.values(status).some((granted) => !granted);
			showBanner = needsAccess;
			isLoading = false;
		}, 3000);

		// Ascolta messaggi dagli iframe
		const messageHandler = (event: MessageEvent) => {
			if (!backends.includes(event.origin)) {
				console.warn(`Messaggio da origine non autorizzata: ${event.origin}`);
				return;
			}

			if (event.data?.type === 'storage-access-result') {
				status[event.origin] = event.data.granted;
				console.log('Risultato da', event.origin, event.data.granted);

				// Se tutti hanno risposto, nascondi loading
				if (Object.keys(status).length === backends.length) {
					clearTimeout(timeoutId);

					const needsAccess = Object.values(status).some((granted) => !granted);
					showBanner = needsAccess;
					isLoading = false;
				}
			}
		};

		window.addEventListener('message', messageHandler);

		return () => {
			window.removeEventListener('message', messageHandler);
			clearTimeout(timeoutId);
		};
	});
</script>

{#if showBanner && !isLoading}
	<div
		class="fixed bottom-4 left-1/2 transform -translate-x-1/2 bg-yellow-200 p-4 text-black rounded-lg shadow-lg flex flex-col z-50"
	>
		<div class="flex items-center justify-between border-b border-yellow-400 pb-2 mb-2 w-full">
			<div>
				<h2 class="font-bold">Hey Firefox user! 👋</h2>
				<p>To make everything work smoothly, add our domain to your cookie exceptions.</p>
				<p class="font-semibold">Don't worry, it's quick and safe!</p>
			</div>
		</div>
		<ul>
			{#each backends as domain, index}
				<li class="flex flex-row w-full items-center justify-start">
					<b class="mr-2">{domain}:</b>
					{#if status[domain]}
						✅ Cookies enabled!
					{:else}
						<span class="loading loading-dots loading-xs"></span>
						Not enabled yet, this website will not work properly without cookies
					{/if}
				</li>
				<iframe
					bind:this={iframes[index]}
					title="Firefox Cookie Banner Helper"
					src="{domain}/cookie-button"
					class="w-full h-10 border-0 {status[domain] ? 'hidden' : ''}"
				></iframe>
			{/each}
		</ul>
	</div>
{/if}
