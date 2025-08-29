<script lang="ts">
	export let answer;
	export let reply;
	export let index;
</script>

<div class="divider"></div>
<div class="ml-8">
	<div class="flex justify-end">
		<div class="text-sm flex justify-center items-center">
			<!-- TODO: usare nome anonimo eventualmente -->
			<a href="https://github.com/{answer.user}" target="_blank" rel="noopener noreferrer">
				{answer.user}
			</a>
		</div>

		<a href="https://github.com/{answer.user}" target="_blank" rel="noopener noreferrer">
		<!-- TODO: usare immagine anonima eventualmente -->
			<img
				class="w-8 h-8 rounded-full ml-3"
				src={'https://github.com/' + answer.user + '.png'}
				alt={answer.user + ' profile picture'}
				loading="lazy"
				referrerpolicy="no-referrer"
			/>
		</a>
	</div>
	<div>{reply.content}</div>
</div>
