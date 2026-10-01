<!--
SPDX-FileCopyrightText: 2026 Eyad Issa <eyadlorenzo@gmail.com>

SPDX-License-Identifier: AGPL-3.0-or-later
-->

<script lang="ts">
	import { browser } from '$app/environment';
	import DOMPurify from 'dompurify';

	let { html }: { html: string } = $props();
	let sanitizedHtml = $derived(browser ? DOMPurify.sanitize(html) : '');
</script>

<!-- eslint-disable-next-line svelte/no-at-html-tags -->
{@html sanitizedHtml}
