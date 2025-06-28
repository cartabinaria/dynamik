<script lang="ts">
	import { page } from '$app/state';
	import { goto } from '$app/navigation';

	let { data } = $props();

	let repoContents = $derived(data.repoContents ?? []);
	let selectedFolder = $state('');
	let fileName = $state('');
	let file = $state<File | null>(null);
	let uploadStatus = $state('');
	let isLoading = $state(false);

	// Get the repo name from the URL (cartabinaria/<name>)
	let repoName = $derived(page.params.dir?.split('/')[0] || '');

	function handleFileChange(event: Event) {
		const input = event.target as HTMLInputElement;
		if (input.files && input.files.length > 0) {
			file = input.files[0];
		}
	}

	async function handleUpload() {
		if (!repoName || !selectedFolder || !fileName || !file) {
			uploadStatus = 'Please select a folder, enter a file name, and choose a file.';
			return;
		}
		uploadStatus = 'Uploading...';
		isLoading = true;

		const formData = new FormData();
		formData.append('repo', repoName);
		formData.append('folder', selectedFolder);
		formData.append('fileName', fileName);
		formData.append('file', file);

		const res = await fetch('./upload', {
			method: 'POST',
			body: formData
		});
		isLoading = false;
		if (res.ok) {
			uploadStatus = 'Upload successful! Pull request created.';
			setTimeout(() => goto('/'), 2000);
		} else {
			const err = await res.text();
			uploadStatus = 'Upload failed: ' + err;
		}
	}
</script>

<svelte:head>
	<title>Upload file to cartabinaria/{repoName}</title>
</svelte:head>

<div class="max-w-xl mx-auto mt-10 p-6 bg-base-200 rounded-xl shadow">
	<a href={'/' + repoName} class="btn btn-sm btn-outline mb-4">
		<span class="icon-[ic--round-arrow-back]"></span>
		Back to {repoName} main page
	</a>
	<h1 class="text-2xl font-bold mb-4">
		Upload a file to <span class="text-primary">cartabinaria/{repoName}</span>
	</h1>

	{#if isLoading}
		<div class="mb-4 text-info">Loading...</div>
	{/if}

	{#if repoContents.length > 0}
		<div class="mb-4">
			<label for="select-folder" class="block font-semibold mb-1">Select folder</label>
			<select id="select-folder" bind:value={selectedFolder} class="select select-bordered w-full">
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
			id="file-name-input"
			type="text"
			bind:value={fileName}
			placeholder="example.pdf"
			class="input input-bordered w-full"
		/>
	</div>

	<div class="mb-4">
		<label for="file-input" class="block font-semibold mb-1">Choose file</label>
		<input
			id="file-input"
			type="file"
			onchange={handleFileChange}
			class="file-input file-input-bordered w-full"
		/>
	</div>

	<button class="btn btn-primary w-full" onclick={handleUpload} disabled={isLoading}>
		{isLoading ? 'Uploading...' : 'Upload & Create Pull Request'}
	</button>

	{#if uploadStatus}
		<div class="mt-4 alert alert-info">{uploadStatus}</div>
	{/if}
</div>
