<!--
SPDX-FileCopyrightText: 2026 Alice Benatti <alice17bee@gmail.com>

SPDX-License-Identifier: AGPL-3.0-or-later
-->

<script lang="ts">
	import { resolve } from '$app/paths';
	import type { PageProps } from './$types';
	import Navbar from '$lib/components/Navbar.svelte';
	import type { Teaching, Degree } from '$lib/teachings';
	import teachingsData from '../../config/teachings.json' assert { type: 'json' };
	import degreesData from '../../config/degrees.json' assert { type: 'json' };

	import LucideFileHeartIcon from '@iconify-svelte/lucide/file-heart';
	import LucideUploadIcon from '@iconify-svelte/lucide/upload';
	import LucideFileIcon from '@iconify-svelte/lucide/file';
	import LucideTrash2Icon from '@iconify-svelte/lucide/trash-2';
	import LucideChevronDownIcon from '@iconify-svelte/lucide/chevron-down';
	import LucideChevronUpIcon from '@iconify-svelte/lucide/chevron-up';
	import LucideSearchIcon from '@iconify-svelte/lucide/search';

	let { data }: PageProps = $props();

	type FileType = 'appunti' | 'dispense' | 'esercizi' | 'lavagne' | 'lucidi' | 'prove' | 'varie';

	type FileMetadata = {
		file: File;
		degree: string;
		teaching: string;
		teachingSearch: string;
		fileType: FileType | '';
		credits: string;
		comments: string;
		expanded: boolean;
	};

	const FILE_TYPES: FileType[] = [
		'appunti',
		'dispense',
		'esercizi',
		'lavagne',
		'lucidi',
		'prove',
		'varie'
	];

	const teachings: Teaching[] = teachingsData;
	const degrees: Degree[] = degreesData;

	let isDragging = $state(false);
	let filesMetadata = $state<FileMetadata[]>([]);
	let fileInput: HTMLInputElement;
	let openDropdownIndex = $state<number | null>(null);

	/**
	 * Filtra gli insegnamenti per un file specifico
	 * basandosi sul corso di laurea selezionato e sul termine di ricerca
	 */
	function getFilteredTeachings(metadata: FileMetadata): Teaching[] {
		let filtered = teachings;

		// Filtra per corso di laurea se selezionato
		if (metadata.degree) {
			const selectedDegree = degrees.find((d) => d.id === metadata.degree);
			if (selectedDegree && selectedDegree.teachings) {
				const teachingUrls = selectedDegree.teachings.map((t) => t.name);
				filtered = teachings.filter((t) => teachingUrls.includes(t.url));
			}
		}

		// Filtra per termine di ricerca
		if (metadata.teachingSearch) {
			filtered = filtered.filter((t) =>
				t.name.toLowerCase().includes(metadata.teachingSearch.toLowerCase())
			);
		}

		return filtered;
	}

	function handleDragOver(e: DragEvent) {
		e.preventDefault();
		isDragging = true;
	}

	function handleDragLeave(e: DragEvent) {
		e.preventDefault();
		isDragging = false;
	}

	function handleDrop(e: DragEvent) {
		e.preventDefault();
		isDragging = false;

		const droppedFiles = e.dataTransfer?.files;
		if (droppedFiles) {
			addFiles(Array.from(droppedFiles));
		}
	}

	function handleFileSelect(e: Event) {
		const target = e.target as HTMLInputElement;
		const selectedFiles = target.files;
		if (selectedFiles) {
			addFiles(Array.from(selectedFiles));
		}
	}

	function addFiles(newFiles: File[]) {
		const newMetadata: FileMetadata[] = newFiles.map((file) => ({
			file,
			degree: '',
			teaching: '',
			teachingSearch: '',
			fileType: '',
			credits: '',
			comments: '',
			expanded: true
		}));
		filesMetadata = [...filesMetadata, ...newMetadata];
	}

	function removeFile(index: number) {
		filesMetadata = filesMetadata.filter((_, i) => i !== index);
	}

	function toggleExpanded(index: number) {
		filesMetadata[index].expanded = !filesMetadata[index].expanded;
	}

	function isFileComplete(metadata: FileMetadata): boolean {
		return metadata.teaching !== '' && metadata.fileType !== '';
	}

	function canSubmit(): boolean {
		return filesMetadata.length > 0 && filesMetadata.every(isFileComplete);
	}

	function formatFileSize(bytes: number): string {
		if (bytes === 0) return '0 Bytes';
		const k = 1024;
		const sizes = ['Bytes', 'KB', 'MB', 'GB'];
		const i = Math.floor(Math.log(bytes) / Math.log(k));
		return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
	}

	function openFilePicker() {
		fileInput?.click();
	}

	/**
	 * Prepara i dati per l'invio al backend
	 * Ogni file viene aggiunto con i suoi metadati
	 */
	function prepareFormData(): FormData {
		const formData = new FormData();

		filesMetadata.forEach((metadata, index) => {
			// Aggiungi il file
			formData.append(`files[${index}]`, metadata.file);

			// Aggiungi i metadati come JSON
			formData.append(
				`metadata[${index}]`,
				JSON.stringify({
					teaching: metadata.teaching,
					fileType: metadata.fileType,
					credits: metadata.credits || null,
					comments: metadata.comments || null,
					originalName: metadata.file.name,
					size: metadata.file.size,
					mimeType: metadata.file.type
				})
			);
		});

		return formData;
	}

	async function handleSubmit() {
		if (!canSubmit()) return;

		const formData = prepareFormData();

		// Qui sarà chiamata l'API per caricare i file
		console.log('Dati da inviare:', {
			totalFiles: filesMetadata.length,
			files: filesMetadata.map((m) => ({
				name: m.file.name,
				teaching: m.teaching,
				fileType: m.fileType,
				credits: m.credits,
				comments: m.comments
			}))
		});

		// TODO: Implementare la chiamata API
		// await fetch('/api/donation-bin/upload', {
		//   method: 'POST',
		//   body: formData
		// });
	}

	// Chiudi dropdown quando si clicca fuori
	function handleClickOutside(event: MouseEvent) {
		const target = event.target as HTMLElement;
		if (!target.closest('.teaching-dropdown-container')) {
			openDropdownIndex = null;
		}
	}
</script>

<svelte:window onclick={handleClickOutside} />

<main class="max-w-7xl p-4 mx-auto">
	<Navbar title="Cestino delle Donazioni"></Navbar>

	<div class="mt-6">
		<div class="flex items-center gap-3 mb-4">
			<LucideFileHeartIcon class="w-10 h-10" />
			<h1 class="text-3xl font-bold">Cestino delle Donazioni</h1>
		</div>
		<p class="text-lg text-content mb-4">
			<i>Non hai tempo o non sai come fare una Pull Request?</i><br />Nessun problema! Puoi
			contribuire al donando risorse che hai trovato utili. Le risorse donate saranno esaminate e,
			se approvate, aggiunte alla piattaforma dai moderatori di CartaBinaria. Grazie per il tuo
			contributo!
		</p>

		<div class="card shadow-xl">
			<div class="card-body">
				<!-- Drop Zone -->
				<div
					class="border-4 border-dashed rounded-xl p-8 transition-all duration-200 {isDragging
						? 'border-primary bg-primary/10 scale-[1.02]'
						: 'border-base-200 bg-base-200/40'}"
					ondragover={handleDragOver}
					ondragleave={handleDragLeave}
					ondrop={handleDrop}
					role="button"
					tabindex="0"
					onclick={openFilePicker}
					onkeydown={(e) => e.key === 'Enter' && openFilePicker()}
				>
					<div class="flex flex-col items-center justify-center gap-4 text-center">
						<LucideUploadIcon
							class="w-16 h-16 {isDragging ? 'text-primary' : 'text-base-content/50'}"
						/>
						<div>
							<p class="text-lg font-semibold">
								{isDragging ? 'Rilascia i file qui' : 'Trascina i file qui'}
							</p>
							<p class="text-sm opacity-70 mt-1">oppure clicca per selezionare i file</p>
						</div>
						<button type="button" class="btn btn-primary btn-sm gap-2">
							<LucideUploadIcon class="w-4 h-4" />
							Seleziona file
						</button>
					</div>
				</div>

				<input
					bind:this={fileInput}
					type="file"
					multiple
					class="hidden"
					onchange={handleFileSelect}
					aria-label="Seleziona file da caricare"
				/>

				<!-- File List -->
				{#if filesMetadata.length > 0}
					<div class="mt-6">
						<h3 class="text-lg font-semibold mb-3">
							File selezionati ({filesMetadata.length})
						</h3>
						<div class="space-y-3">
							{#each filesMetadata as metadata, i (i)}
								<div class="card bg-base-200/40 border border-base-300">
									<div class="card-body p-4">
										<!-- File Header -->
										<div class="flex items-center justify-between">
											<div class="flex items-center gap-3 flex-1 min-w-0">
												<LucideFileIcon class="w-5 h-5 text-primary shrink-0" />
												<div class="min-w-0 flex-1">
													<p class="font-medium truncate">{metadata.file.name}</p>
													<p class="text-sm opacity-70">{formatFileSize(metadata.file.size)}</p>
												</div>
												{#if !isFileComplete(metadata)}
													<span class="badge badge-warning badge-sm">Incompleto</span>
												{:else}
													<span class="badge badge-success badge-sm">Completo</span>
												{/if}
											</div>
											<div class="flex gap-2">
												<button
													type="button"
													class="btn btn-ghost btn-sm btn-circle"
													onclick={() => toggleExpanded(i)}
													aria-label={metadata.expanded ? 'Comprimi' : 'Espandi'}
												>
													{#if metadata.expanded}
														<LucideChevronUpIcon class="w-4 h-4" />
													{:else}
														<LucideChevronDownIcon class="w-4 h-4" />
													{/if}
												</button>
												<button
													type="button"
													class="btn btn-ghost btn-sm btn-circle text-error"
													onclick={() => removeFile(i)}
													aria-label="Rimuovi file"
												>
													<LucideTrash2Icon class="w-4 h-4" />
												</button>
											</div>
										</div>
										{#if metadata.file.name.endsWith('.pdf')}
											<span class="text-warning"
												><i>Hai caricato un file PDF, per caso hai i file sorgenti?</i><br
												/>Condividere i sorgenti da a tutti la possibilità di collaborare e/o
												modificare eventuali errori. Supportiamo
												<code>.tex/.md/.typ/.doc(x)/.odt(x)</code>, una volta caricati sulla
												repository verranno automaticamente compilati per la visione web.</span
											>
										{/if}

										<!-- File Metadata Form -->
										{#if metadata.expanded}
											<div class="flex flex-col">
												<div class="mt-4 space-y-4 flex flex-col lg:flex-row gap-4">
													<div class="flex flex-col w-full">
														<!-- Corso di Laurea -->
														<div class="form-control">
															<label class="label">
																<span class="label-text font-semibold">Corso di Laurea</span>
																<select
																	bind:value={metadata.degree}
																	class="select select-bordered w-full"
																	onchange={() => {
																		metadata.teaching = '';
																		metadata.teachingSearch = '';
																	}}
																>
																	<option value="">Tutti i corsi (opzionale)</option>
																	{#each degrees as degree (degree.id)}
																		<option value={degree.id}>{degree.icon} {degree.name}</option>
																	{/each}
																</select>
															</label>
															{#if metadata.degree}
																{@const selectedDegree = degrees.find(
																	(d) => d.id === metadata.degree
																)}
																<span class="label-text-alt text-info mt-1">
																	✓ Filtrando per {selectedDegree?.name}
																</span>
															{/if}
														</div>

														<!-- Insegnamento -->
														<div class="form-control teaching-dropdown-container">
															<label class="label">
																<span class="label-text font-semibold"
																	>Insegnamento <span class="text-error">*</span></span
																>
																<div class="relative w-full">
																	<span
																		class="absolute left-3 top-1/2 -translate-y-1/2 opacity-50 z-10 pointer-events-none"
																	>
																		<LucideSearchIcon class="w-4 h-4" />
																	</span>
																	<input
																		type="text"
																		bind:value={metadata.teachingSearch}
																		class="input input-bordered w-full pl-10 pr-10"
																		placeholder="Cerca o seleziona un insegnamento..."
																		required
																		onfocus={() => (openDropdownIndex = i)}
																		oninput={() => {
																			openDropdownIndex = i;
																			const filtered = getFilteredTeachings(metadata);
																			const exactMatch = filtered.find(
																				(t) => t.name === metadata.teachingSearch
																			);
																			if (exactMatch) {
																				metadata.teaching = exactMatch.url;
																			} else {
																				metadata.teaching = '';
																			}
																		}}
																	/>
																	<span
																		class="absolute right-3 top-1/2 -translate-y-1/2 opacity-50 pointer-events-none transition-transform {openDropdownIndex ===
																		i
																			? 'rotate-180'
																			: ''}"
																	>
																		<LucideChevronDownIcon class="w-4 h-4" />
																	</span>
																</div>
															</label>

															<!-- Custom Dropdown -->
															{#if openDropdownIndex === i}
																{@const filteredTeachings = getFilteredTeachings(metadata)}
																{#if filteredTeachings.length > 0}
																	<div
																		class="absolute z-50 w-1/3 mt-1 bg-base-100 border-2 border-primary/20 rounded-box shadow-xl max-h-64 overflow-y-auto animate-in fade-in slide-in-from-top-2 duration-200"
																		role="listbox"
																	>
																		{#each filteredTeachings.slice(0, 50) as teaching (teaching.url)}
																			{@const isSelected = metadata.teaching === teaching.url}
																			<button
																				type="button"
																				class="w-full text-left px-4 py-3 hover:bg-primary/10 transition-all duration-150 border-b border-base-200/50 last:border-b-0 flex items-start gap-2 group {isSelected
																					? 'bg-primary/5'
																					: ''}"
																				onclick={() => {
																					metadata.teachingSearch = teaching.name;
																					metadata.teaching = teaching.url;
																					openDropdownIndex = null;
																				}}
																			>
																				<div class="flex-1 min-w-0">
																					<div
																						class="font-medium group-hover:text-primary transition-colors"
																					>
																						{teaching.name}
																					</div>
																					{#if teaching.professors && teaching.professors.length > 0}
																						<div class="text-xs opacity-60 mt-1 line-clamp-1">
																							👨‍🏫 {teaching.professors
																								.map((p) => p.split('.').join(' '))
																								.join(', ')}
																						</div>
																					{/if}
																				</div>
																				{#if isSelected}
																					<span class="text-success text-xs mt-0.5">✓</span>
																				{/if}
																			</button>
																		{/each}
																		{#if filteredTeachings.length > 50}
																			<div
																				class="px-4 py-3 text-sm opacity-60 text-center bg-base-200/30 sticky bottom-0"
																			>
																				<div class="font-medium">
																					+{filteredTeachings.length - 50} altri insegnamenti
																				</div>
																				<div class="text-xs mt-0.5">
																					Continua a digitare per filtrare
																				</div>
																			</div>
																		{/if}
																	</div>
																{:else if metadata.teachingSearch}
																	<div
																		class="absolute z-50 w-full mt-1 bg-base-100 border border-base-300 rounded-box shadow-lg px-4 py-3 text-center"
																	>
																		<div class="text-sm opacity-60">
																			Nessun insegnamento trovato
																		</div>
																		<div class="text-xs opacity-40 mt-1">
																			Prova con un altro termine di ricerca
																		</div>
																	</div>
																{/if}
															{/if}
															{#if metadata.degree}
																{@const filteredCount = getFilteredTeachings(metadata).length}
																<span class="label-text-alt opacity-70 mt-1">
																	{filteredCount} insegnament{filteredCount === 1 ? 'o' : 'i'} disponibil{filteredCount ===
																	1
																		? 'e'
																		: 'i'}
																</span>
															{/if}
															{#if metadata.teachingSearch && !metadata.teaching}
																<span class="label-text-alt text-warning mt-1">
																	Seleziona un insegnamento dalla lista
																</span>
															{/if}
															{#if metadata.teaching}
																<span class="label-text-alt text-success mt-1">
																	✓ Insegnamento selezionato
																</span>
															{/if}
														</div>
													</div>
													<div class="divider lg:divider-horizontal w-min"></div>
													<div class="flex flex-col w-full">
														<!-- Tipo di File -->
														<div class="form-control *:w-full">
															<label class="label">
																<span class="label-text font-semibold"
																	>Tipo di file <span class="text-error">*</span></span
																>
																<select
																	bind:value={metadata.fileType}
																	class="select select-bordered w-full"
																	required
																>
																	<option value="">Seleziona un tipo</option>
																	{#each FILE_TYPES as type}
																		<option value={type}>{type}</option>
																	{/each}
																</select>
															</label>
														</div>

														<!-- Credits -->
														<div class="form-control *:w-full">
															<label class="label">
																<span class="label-text font-semibold"
																	>Credits - sarà aggiunto al nome del file</span
																>
																<input
																	type="text"
																	bind:value={metadata.credits}
																	placeholder="Il tuo username GitHub o nickname/nome che vuoi venga associato a questa risorsa"
																	class="input input-bordered w-full"
																/>
															</label>
														</div>
													</div>
												</div>
												<!-- Commenti -->
												<div class="flex form-control *:w-full">
													<label class="label">
														<span class="label-text font-semibold">Commenti</span>
														<textarea
															bind:value={metadata.comments}
															placeholder="Aggiungi eventuali note o commenti come: l'anno del corso, il professore, data prova..."
															class="textarea textarea-bordered h-20 w-full"
														></textarea>
													</label>
												</div>
											</div>
										{/if}
									</div>
								</div>
							{/each}
						</div>

						<div class="mt-6 flex gap-3">
							<button
								type="button"
								class="btn btn-primary gap-2"
								disabled={!canSubmit()}
								onclick={handleSubmit}
							>
								<LucideUploadIcon class="w-5 h-5" />
								Carica {filesMetadata.length} file
							</button>
							<button
								type="button"
								class="btn btn-ghost gap-2"
								onclick={() => (filesMetadata = [])}
							>
								<LucideTrash2Icon class="w-4 h-4" />
								Annulla Caricamento
							</button>
						</div>
					</div>
				{/if}
			</div>
		</div>
	</div>
</main>

<style>
	.label {
		display: flex;
		flex-direction: column;
		align-items: baseline;
		margin-top: 2.5%;
	}
</style>
