<!--
SPDX-FileCopyrightText: 2025 Alice Benatti <alice17bee@gmail.com>

SPDX-License-Identifier: AGPL-3.0-or-later
-->
<script lang="ts">
	import { GH_PAGES_BASE_URL } from '$lib/const';

	function acceptCookies() {
		localStorage.setItem('cookie-consent', 'accepted');
		document.querySelector('.alert')?.remove();
	}
	function rejectCookies() {
		localStorage.setItem('cookie-consent', 'rejected');
		document.querySelector('.alert')?.remove();
	}
</script>

<p
	class=" rounded-box bottom-0 w-full m-4 text-base-content/80 items-center text-sm"
>
	Questo sito utilizza solo cookie tecnici e raccoglie alcuni dati personali necessari al
	funzionamento. Consulta la nostra <a
		href="${GH_PAGES_BASE_URL}/it/privacy"
		class="link link-info underline font-semibold w-max"
	>
		 Privacy & Cookie Policy
		<span class="icon-[mdi--cookie] text-xl"></span>
	</a>
</p>
