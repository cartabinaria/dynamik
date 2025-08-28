<script lang="ts">
	export let setEditMode: (flag: boolean) => void;
	export let isAdmin: boolean;
</script>

<div class="flex justify-center mb-2">
	<div class="text-center">
		<span class="text-5xl icon-[solar--sad-circle-broken]"></span>
		<p class="text-xl mb-8">
			Sorry, but the document isn't ready for responses yet. Please check back soon!
		</p>

		{#if isAdmin}
			<button class="btn btn-ghost" on:click|preventDefault={() => setEditMode(true)}>
				Preparalo
			</button>
		{/if}
		<button class="btn btn-ghost" on:click|preventDefault={() => history.back()}>
			Torna indietro
		</button>
	</div>
</div>
