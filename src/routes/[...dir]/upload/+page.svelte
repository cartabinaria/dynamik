<script lang="ts">
	import { enhance } from '$app/forms';
	import { page } from '$app/state';

	let { data, form } = $props();

	let { repoContents } = $derived(data);

	let uploadStatus = $state('');
	let isLoading = $state(false);

	// Get the repo name from the URL (cartabinaria/<name>)
	let repoName = $derived(page.params.dir?.split('/')[0] || '');
</script>

<svelte:head>
	<title>Upload file to cartabinaria/{repoName}</title>
</svelte:head>

<form
	method="POST"
	enctype="multipart/form-data"
	class="max-w-xl mx-auto mt-10 p-6 bg-base-200 rounded-xl shadow"
	use:enhance={() => {
		isLoading = true;
		return async ({ update }) => {
			isLoading = false;
			update();
		};
	}}
>
	<a href={'/' + repoName} class="btn btn-sm btn-outline mb-4">
		<span class="icon-[ic--round-arrow-back]"></span>
		Back to {repoName} main page
	</a>
	<h1 class="text-2xl font-bold mb-4">
		Upload a file to <span class="text-primary">cartabinaria/{repoName}</span>
	</h1>

	<input type="hidden" name="repo" value={repoName} />

	{#if form?.error != null}
		<div class="mb-4 alert alert-error">
			<strong>Error:</strong>
			{form.error}
		</div>
	{/if}

	{#if repoContents.length === 0}
		<div class="mb-4 alert alert-warning">No folders found in this repository.</div>
	{/if}

	{#if repoContents.length > 0}
		<div class="mb-4">
			<label for="select-folder" class="block font-semibold mb-1">Select folder</label>
			<select name="folder" id="select-folder" class="select select-bordered w-full">
				<option value="" disabled selected>Select a folder</option>
				{#each repoContents as folder (folder.path)}
					<option value={folder.path}>{folder.path}</option>
				{/each}
			</select>
		</div>
	{/if}

	<div class="mb-4">
		<label for="file-name-input" class="block font-semibold mb-1">File name</label>
		<input
			name="fileName"
			id="file-name-input"
			type="text"
			placeholder="example.pdf"
			class="input input-bordered w-full"
		/>
	</div>

	<div class="mb-4">
		<label for="file-input" class="block font-semibold mb-1">Choose file</label>
		<input name="file" id="file-input" type="file" class="file-input file-input-bordered w-full" />
	</div>

	<button class="btn btn-primary w-full" disabled={isLoading} type="submit">
		{isLoading ? 'Uploading...' : 'Upload & Create Pull Request'}
	</button>

	{#if uploadStatus}
		<div class="mt-4 alert alert-info">{uploadStatus}</div>
	{/if}

	{#if form?.prUrl != null}
		<div class="mt-4 alert alert-success">
			Pull request created: <a href={form.prUrl} target="_blank" class="link">
				{form.prUrl}
			</a>
		</div>
	{/if}
</form>
