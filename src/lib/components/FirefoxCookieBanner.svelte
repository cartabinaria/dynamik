<!-- 
SPDX-FileCopyrightText: 2025 Alice Benatti <alice17bee@gmail.com>

SPDX-License-Identifier: AGPL-3.0-or-later
 -->

<script lang="ts">
	import { AUTH_BASE_URL, POLLEG_BASE_URL } from '$lib/const';
	import { onMount } from 'svelte';

	const backends = [POLLEG_BASE_URL, AUTH_BASE_URL];
	let showBanner = true;

	// mappa stato: dominio → granted?
	let status: Record<string, boolean> = {};

	let iframes: HTMLIFrameElement[] = [];

	onMount(() => {
		// ascolta messaggi dagli iframe
		window.addEventListener('message', (event) => {
			if (!backends.includes(event.origin)) return;

			if (event.data?.type === 'storage-access-result') {
				status[event.origin] = event.data.granted;
				status = { ...status }; // forza reattività
				console.log('Risultato da', event.origin, event.data.granted);
			}
		});
	});

	function requestAccess() {
		// manda messaggio a tutti gli iframe per iniziare la richiesta
		iframes.forEach((frame) => {
			frame.contentWindow?.postMessage({ type: 'request-storage-access' }, frame.src);
		});
	}
</script>

{#if showBanner}
	<div
		class="fixed bottom-4 left-1/2 transform -translate-x-1/2 bg-yellow-200 p-4 text-black rounded-lg shadow-lg flex flex-col items-center z-50"
	>
		<div class="flex items-center justify-between border-b border-yellow-400 pb-2 mb-2 w-full">
			<div>
				<h2 class="font-bold">Hey Firefox user! 👋</h2>
				<p>To make everything work smoothly, add our domain to your cookie exceptions.</p>
				<p class="font-semibold">Don't worry, it's quick and safe!</p>
			</div>

			<button
				on:click={requestAccess}
				class="ml-4 btn btn-warning"
				title="Click here to allow cookies for our service domains"
			>
				<span class="icon-[mdi--firefox] text-lg"></span>
				Enable cookies
			</button>
		</div>

		<ul>
			<p class="font-semibold">Current status:</p>
			{#each backends as domain}
				<li>
					<b>{domain}:</b>
					{#if status[domain]}✅ Cookies enabled!{:else}<span
							class="loading loading-dots loading-xs"
						></span> Not enabled yet, this website will not work properly without cookies{/if}
				</li>
			{/each}
		</ul>
	</div>
{/if}

<!-- iframes nascosti -->
{#each backends as domain}
	<iframe
		bind:this={iframes[backends.indexOf(domain)]}
		title="Firefox Cookie Banner Helper"
		src={domain + '/storage-access'}
		style="display:none"
	></iframe>
{/each}
