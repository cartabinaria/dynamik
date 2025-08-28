<script lang="ts">
	import { Carta, CartaEditor } from 'carta-md';
	import { emoji } from '@cartamd/plugin-emoji';
	import { code } from '@cartamd/plugin-code';
	import { math } from '@cartamd/plugin-math';

	import { POLLEG_BASE_URL } from '$lib/const';

	const carta = new Carta({
		extensions: [emoji(), code(), math()],
		sanitizer: false
	});

	let body: string;
	let disabled: boolean = false;
	export let submit: (body: string, parent?: number | null) => Promise<boolean>;

	const handleSubmit = async () => {
		disabled = true;
		if (await submit(body, null)) body = '';
		disabled = false;
	};
</script>

<div class="rounded-xl max-w-4xl w-full flex flex-col items-center justify-center mb-4">
	<div class="w-full">
		<CartaEditor bind:disabled bind:value={body} mode="tabs" theme="github" {carta} />
	</div>
	<div class="flex w-full justify-end py-3">
		<button class="btn btn-seconday btn-sm" on:click|preventDefault={handleSubmit}> Submit </button>
	</div>
</div>
