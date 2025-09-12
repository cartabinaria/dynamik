/*
SPDX-FileCopyrightText: 2025 Alice Benatti <alice17bee@gmail.com>

SPDX-License-Identifier: AGPL-3.0-or-later
*/

import type { PageLoad } from './$types';
import faqContent from './faq.md?raw';

export const load: PageLoad = async () => {
	// Parse del contenuto markdown per estrarre categorie, domande e risposte
	const lines = faqContent.split('\n');
	const categories: Array<{
		name: string;
		faqs: Array<{ question: string; answer: string }>;
	}> = [];

	let currentCategory = '';
	let currentQuestion = '';
	let currentAnswer = '';
	let inAnswer = false;
	let metadata = {
		title: 'FAQ - Frequently Asked Questions',
		description: 'Answers to the most common questions about Dynamik'
	};

	for (const line of lines) {
		// Parse metadata (frontmatter)
		if (line.startsWith('title:')) {
			metadata.title = line.replace('title:', '').replace(/"/g, '').trim();
			continue;
		}
		if (line.startsWith('description:')) {
			metadata.description = line.replace('description:', '').replace(/"/g, '').trim();
			continue;
		}

		if (line.startsWith('# ')) {
			// Salva la domanda precedente se esiste
			if (currentQuestion && currentAnswer) {
				const category = categories.find((c) => c.name === currentCategory);
				if (category) {
					category.faqs.push({
						question: currentQuestion,
						answer: currentAnswer.trim()
					});
				}
			}

			// Nuova categoria
			currentCategory = line.replace('# ', '');
			categories.push({ name: currentCategory, faqs: [] });
			currentQuestion = '';
			currentAnswer = '';
			inAnswer = false;
		} else if (line.startsWith('## ')) {
			// Salva la domanda precedente se esiste
			if (currentQuestion && currentAnswer) {
				const category = categories.find((c) => c.name === currentCategory);
				if (category) {
					category.faqs.push({
						question: currentQuestion,
						answer: currentAnswer.trim()
					});
				}
			}

			// Nuova domanda
			currentQuestion = line.replace('## ', '');
			currentAnswer = '';
			inAnswer = true;
		} else if (inAnswer && !line.startsWith('---')) {
			// Aggiungi alla risposta corrente (preserva righe vuote per paragrafi)
			currentAnswer += line + '\n';
		}
	}

	// Aggiungi l'ultima domanda se presente
	if (currentQuestion && currentAnswer) {
		const category = categories.find((c) => c.name === currentCategory);
		if (category) {
			category.faqs.push({
				question: currentQuestion,
				answer: currentAnswer.trim()
			});
		}
	}

	return {
		categories,
		metadata
	};
};
