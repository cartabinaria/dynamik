<!--
SPDX-FileCopyrightText: 2025 Alice Benatti <alice17bee@gmail.com>

SPDX-License-Identifier: AGPL-3.0-or-later
-->

<script lang="ts">
	import { Markdown } from 'carta-md';
	import { resolve } from '$app/paths';

	import { carta } from '$lib/carta-config';
	import LanguageSwitcher from '$lib/components/LanguageSwitcher.svelte';

	import type { PageProps } from './$types';
	let { data }: PageProps = $props();

	// Search state
	let searchTerm = $state('');
	let expandedIndex: string | null = $state(null);

	// Cache normalized search term to avoid repeated toLowerCase() calls
	let normalizedSearchTerm = $derived(searchTerm.toLowerCase());

	// Filter categories and FAQs based on search
	let filteredCategories =
		data.categories
			?.map((category) => ({
				...category,
				faqs: category.faqs.filter((faq) => {
					const questionLower = faq.question.toLowerCase();
					const answerLower = faq.answer.toLowerCase();

					return (
						questionLower.includes(normalizedSearchTerm) ||
						answerLower.includes(normalizedSearchTerm)
					);
				})
			}))
			.filter((category) => category.faqs.length > 0) || [];

	// Count total filtered FAQs
	let totalFilteredFaqs = $derived(
		filteredCategories.reduce((total, category) => total + category.faqs.length, 0)
	);

	// Function to toggle accordion
	const toggleAccordion = (id: string) => {
		expandedIndex = expandedIndex === id ? null : id;
	};
</script>

<svelte:head>
	<title>{data.metadata?.title || 'FAQ'} - Dynamik</title>
	<meta name="description" content={data.metadata?.description || 'Frequently asked questions'} />
</svelte:head>

<div class="container mx-auto px-4 py-8 max-w-4xl">
	<nav class="navbar">
		<div class="navbar-start flex items-center">
			<a
				href={resolve('/')}
				class="btn btn-ghost btn-primary rounded-lg"
				title="Home"
				aria-label="Home"
			>
				<span class="icon-[ic--round-home]"></span>
				Home
			</a>
		</div>
		<!-- Language Switcher -->
		<div class="navbar-end">
			<LanguageSwitcher currentLang="en" />
		</div>
	</nav>

	<!-- Header -->
	<div class="text-center mb-8">
		<h1 class="text-4xl font-bold text-primary mb-4">
			{data.metadata?.title || 'FAQ - Frequently Asked Questions'}
		</h1>
		<p class="text-lg text-base-content/70">
			{data.metadata?.description || 'Find answers to the most common questions quickly'}
		</p>
	</div>

	<!-- Search Bar -->
	<div class="mb-8">
		<div class="form-control w-full">
			<div class="input-group">
				<input
					type="text"
					placeholder="Search in FAQ..."
					class="input input-bordered w-full focus:ring-2 focus:ring-primary/20"
					bind:value={searchTerm}
				/>
			</div>
		</div>
	</div>

	<!-- FAQ Count -->
	{#if searchTerm}
		<div class="mb-4 text-sm text-base-content/60">
			{totalFilteredFaqs} result{totalFilteredFaqs() !== 1 ? 's' : ''} found
		</div>
	{/if}

	<!-- FAQ Categories -->
	{#if filteredCategories.length > 0}
		<div class="space-y-6">
			{#each filteredCategories as category, categoryIndex (category.name)}
				<div class="join join-vertical bg-base-100">
					<!-- Category Header -->
					<div class="bg-base-200 p-4 rounded-t-lg border border-base-300">
						<h2 class="text-xl font-bold text-primary flex items-center gap-3">
							<span class="icon-[solar--folder-bold] text-2xl"></span>
							{category.name}
						</h2>
					</div>

					<!-- Category FAQs -->
					{#each category.faqs as faq, faqIndex (faq.question)}
						{@const accordionId = `${categoryIndex}-${faqIndex}`}
						<div class="collapse collapse-arrow join-item border-base-300 border">
							<input
								type="radio"
								name="faq-accordion-{categoryIndex}"
								checked={expandedIndex === accordionId}
								onchange={() => toggleAccordion(accordionId)}
							/>
							<div class="collapse-title font-semibold text-base flex items-center gap-3">
								<span class="icon-[solar--question-circle-bold] text-primary text-xl flex-shrink-0"
								></span>
								{faq.question}
							</div>
							<div class="collapse-content">
								<div class="pt-2 pl-8">
									<div class="prose prose-sm max-w-none">
										<Markdown {carta} value={faq.answer} />
									</div>
								</div>
							</div>
						</div>
					{/each}
				</div>
			{/each}
		</div>
	{:else}
		<!-- No results -->
		<div class="text-center py-12">
			<div class="text-6xl mb-4 opacity-30">🔍</div>
			<h3 class="text-xl font-semibold text-base-content/70 mb-2">No results found</h3>
			<p class="text-base-content/60">
				Try modifying your search terms or
				<button class="link link-primary" onclick={() => (searchTerm = '')}> view all FAQs </button>
			</p>
		</div>
	{/if}

	<!-- Help Section -->
	<div class="mt-12 text-center">
		<div class="divider"></div>
		<div class="bg-base-200/50 rounded-lg p-6">
			<h3 class="text-lg font-semibold mb-2 flex items-center justify-center gap-2">
				Didn't find what you were looking for?
			</h3>
			<p class="text-base-content/70 mb-4">
				If you can't find the answer to your question, don't hesitate to contact us.
			</p>
			<div class="flex flex-wrap justify-center gap-4">
				<a href="https://t.me/cartabinaria" target="_blank" class="btn btn-primary btn-sm">
					<span class="icon-[ic--baseline-telegram] text-lg"></span>
					Contact support
				</a>
				<a
					href="https://github.com/cartabinaria/dynamik/issues"
					target="_blank"
					class="btn btn-outline btn-sm"
				>
					<span class="icon-[solar--bug-bold]"></span>
					Report an issue
				</a>
			</div>
		</div>
	</div>
</div>
