<!--
SPDX-FileCopyrightText: 2023 - 2024 Alice Benatti <alice17bee@gmail.com>
SPDX-FileCopyrightText: 2023 - 2025 Eyad Issa <eyadlorenzo@gmail.com>
SPDX-FileCopyrightText: 2023 Erik Koci <kocierik@gmail.com>
SPDX-FileCopyrightText: 2024 Samuele Musiani <samu@teapot.ovh>

SPDX-License-Identifier: AGPL-3.0-or-later
-->

<script lang="ts">
	import { page } from '$app/stores';
	import settings from '$lib/settings';
	import type { File, Directory } from '$lib/api';
	import { formatDate } from '$lib/date';
	import { getDoneStatus } from '$lib/todo-file';
	import { GH_PAGES_BASE_URL } from '$lib/const';

	import IconAkarLinkChain from '@iconify-svelte/akar-icons/link-chain';
	import IconSolarFileBoldDuotone from '@iconify-svelte/solar/file-bold-duotone';
	import IconSolarFileCheckBoldDuotone from '@iconify-svelte/solar/file-check-bold-duotone';
	import IconSolarFolderBold from '@iconify-svelte/solar/folder-bold';
	import IconSolarDownloadSquareBold from '@iconify-svelte/solar/download-square-bold';

	let { data }: { data: File | Directory } = $props();

	/**
	 * Check if the statik url for the data uses an external link to 'cartabinaria.github.io'
	 *
	 * This function is especially created for '/libri/'.
	 */
	function isUsingExternalBase(data: File | Directory) {
		if (data.url.startsWith(GH_PAGES_BASE_URL)) {
			return false;
		}
		return true;
	}

	function splitDate(date: string) {
		const [day, month, year, time] = date.split(' ');
		return { day, month, year, time };
	}

	let base = $derived($page.url.pathname.split('?')[0]);
	let isFile = $derived('mime' in data);
	let external = $derived('mime' in data ? data.mime === 'text/statik-link' : false);
	let isDone = $derived(getDoneStatus(data.url));
</script>

<div class="contents">
	<div class="contents">
		<span class="flex items-center flex-[1_0_auto] w-max">
			{#if external}
				<input
					type="checkbox"
					class="checkbox checkbox-xs md:checkbox-sm mr-2"
					id="my-checkbox"
					disabled
				/>
				<IconAkarLinkChain class="w-5 h-5 mr-2 text-[#AFD2E9]" />
				<a
					class="flex link link-hover text-primary sm:flex-wrap"
					href={data.url}
					target="_blank"
					rel="noreferrer"
				>
					{data.name}
				</a>
			{:else if isFile}
				<input
					type="checkbox"
					class="checkbox checkbox-xs md:checkbox-sm mr-2"
					id="my-checkbox"
					bind:checked={$isDone}
				/>
				<button
					class="flex text-xl mr-2 align-center"
					onclick={() => isDone.toggle()}
					type="button"
					title="Click to mark as done"
					aria-label="Click to mark as done"
				>
					{#if $isDone}
						<IconSolarFileCheckBoldDuotone class="text-success w-5 h-5" />
					{:else}
						<IconSolarFileBoldDuotone class="text-[#AFD2E9] w-5 h-5" />
					{/if}
				</button>
				<a
					class="flex link link-hover sm:flex-wrap text-primary"
					class:line-through={$isDone}
					href="{base}/{data.name}?{$page.url.searchParams}"
					target={$settings.newTab ? '_blank' : '_self'}
				>
					{data.name}
				</a>
			{:else}
				<input type="checkbox" class="checkbox checkbox-sm mr-2" id="my-checkbox" disabled />
				<IconSolarFolderBold class="text-[#FDE74C] w-5 h-5 mr-2" />
				<a
					class="flex link link-hover sm:flex-wrap text-primary"
					href={isUsingExternalBase(data)
						? base + '/' + data.name + '?' + $page.url.searchParams
						: data.url + '?' + $page.url.searchParams}
				>
					{data.name}
				</a>
			{/if}
		</span>
		<div class="flex flex-0"></div>
		<span class="flex flex-col md:flex-row items-center justify-end whitespace-nowrap text-xs">
			{#if isFile}
				{isFile && data.size != '0 B' ? data.size : '-'}
				{#if data.size != '0 B'}
					<a
						aria-label="Download"
						class="flex text-lg ml-3"
						href={GH_PAGES_BASE_URL + base + '/' + data.name}
						download
						target="_blank"
					>
						<IconSolarDownloadSquareBold class="text-accent w-7 h-7 ml-3" />
					</a>
				{:else}
					<button disabled class="flex text-lg ml-3" aria-label="Download">
						<IconSolarDownloadSquareBold class="text-neutral w-7 h-7 ml-3" />
					</button>
				{/if}
			{/if}
		</span>
		<span class="hidden md:block">
			{#if $settings.isoDates}
				{data.time ? formatDate($settings, data.time) : '-'}
			{:else if data.time}
				{@const dateParts = splitDate(formatDate($settings, data.time))}
				<div class="ml-4 grid grid_date grid-flow-col">
					<div class="justify-self-end mr-2">{dateParts.day}</div>
					<div>{dateParts.month}</div>
					<div>{dateParts.year}</div>
					<!-- <div class="ml-1">{dateParts.time}</div> -->
				</div>
			{/if}
		</span>
	</div>
</div>

<style>
	.grid_date {
		grid-template-columns: 5% 60% auto auto;
	}
</style>
