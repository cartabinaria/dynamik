<script lang="ts">
	import { page } from '$app/stores';
	import settings from '$lib/settings';
	import type { File, Directory } from '$lib/api';
	import { formatDate } from '$lib/date';
	import { getDoneStatus } from '$lib/todo-file';
	import { GH_PAGES_BASE_URL } from '$lib/const';

	export let data: File | Directory;
	// export let customUrl: string | undefined = undefined;

	$: base = $page.url.pathname.split('?')[0];
	$: isFile = 'mime' in data;
	$: external = 'mime' in data ? data.mime === 'text/statik-link' : false;

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

	$: isDone = getDoneStatus(data.url);

	function splitDate(date: string) {
		const [day, month, year, time] = date.split(' ');
		return { day, month, year, time };
	}
</script>

<div class="contents">
	<div class="contents">
		<span class="flex items-center flex-[1_0_auto] w-max">
			{#if external}
				<span class="flex text-xl icon-[akar-icons--link-chain] mr-2" style="color: #AFD2E9"></span>
				<a
					class="flex link link-hover text-primary sm:flex-wrap"
					href={data.url}
					target="_blank"
					rel="noreferrer"
				>
					{data.name}
				</a>
			{:else if isFile}
				<button
					class="flex text-xl mr-2 align-center"
					on:click={() => isDone.toggle()}
					type="button"
					title="Click to mark as done"
					aria-label="Click to mark as done"
				>
					<span
						class="text-bold icon-[solar--file-bold-duotone]"
						style={$isDone ? '' : 'color: #AFD2E9'}
						class:icon-[solar--file-check-bold-duotone]={$isDone}
						class:text-success={$isDone}
					></span>
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
				<span class="flex icon-[solar--folder-bold] text-xl mr-2" style="color: #FDE74C"></span>
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
		<span class="flex items-center justify-end whitespace-nowrap text-xs">
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
						<span class="text-accent text-3xl icon-[solar--download-square-bold]"></span>
					</a>
				{:else}
					<button disabled class="flex text-lg ml-3" aria-label="Download">
						<span class="text-neutral text-3xl icon-[solar--download-square-bold]"></span>
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
					<div class="ml-1">{dateParts.time}</div>
				</div>
			{/if}
		</span>
	</div>
</div>

<style>
	.grid_date {
		grid-template-columns: 5% 45% auto auto;
	}
</style>
