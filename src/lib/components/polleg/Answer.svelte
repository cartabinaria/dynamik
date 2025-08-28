<script lang="ts">
	import { ANSWER_URL, VOTE_URL } from '$lib/const';
	import Reply from '$lib/components/polleg/Reply.svelte';
	import { auth } from '$lib/stores/auth';

	export let answer;
	export let index;
	export let question;
	export let removeAnswer;
	export let data; // Add data prop for question data

	$: showReplyBoxFor = null;
	let unfinishedReplies: string[] = [];

	const deleteAnswer = async (id: number) => {
		let res = await fetch(ANSWER_URL(id), {
			method: 'DELETE',
			credentials: 'include'
		});

		if (res.status == 200) {
			let newAns = data?.answers?.filter(function (item: any) {
				return item.id != id;
			});
			data.answers = newAns;
		} else {
			res = await res.json();
		}
	};
	const vote = async (index: number, answerId: number, newVote: number) => {
		if (data?.answers[index].vote == newVote) newVote = 0;

		let res = await (
			await fetch(VOTE_URL(answerId), {
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify({ vote: newVote }),
				method: 'POST',
				credentials: 'include'
			})
		).json();

		if (res) {
			let oldVote = data.answers[index].vote;
			if (oldVote == 1 && (newVote == 0 || newVote == -1)) {
				data.answers[index].upvotes--;
			}
			if (oldVote == -1 && (newVote == 0 || newVote == 1)) {
				data.answers[index].downvotes--;
			}

			if (newVote == 1) {
				data.answers[index].upvotes++;
			}
			if (newVote == -1) {
				data.answers[index].downvotes++;
			}
			data.answers[index].count = data.answers[index].upvotes - data.answers[index].downvotes;
			data.answers[index].vote = newVote;
			//customSort();
		}
	};
</script>

<div class="w-full flex flex-row rounded-lg bg-base-100 border-secondary shadow-md p-6">
	<!-- Voting Section -->
	<div class="flex flex-col items-center p-2">
		<!-- Upvote Button -->
		<button
			class={'flex items-center justify-center w-10 h-10 rounded-full transition-colors hover:bg-success focus:outline-none ' +
				(answer?.vote == 1 ? 'bg-success' : 'bg-neutral-content')}
			on:click={() => vote(index, answer.id, 1)}
		>
			<span class="icon-[material-symbols--arrow-upward] text-neutral"></span>
		</button>

		<!-- Vote Count -->
		<span class="text-xl p-2 font-semibold">{answer.upvotes - answer.downvotes}</span>

		<!-- Downvote Button -->
		<button
			class={'flex items-center justify-center w-10 h-10 rounded-full transition-colors hover:bg-error focus:outline-none ' +
				(answer?.vote == -1 ? 'bg-error' : 'bg-neutral-content')}
			on:click={() => vote(index, answer.id, -1)}
		>
			<span class="icon-[material-symbols--arrow-downward] text-neutral"></span>
		</button>
	</div>
	<!-- Answer Content -->
	<div class="flex flex-1 flex-col">
		<div class="flex justify-end">
			<div class="text-sm flex justify-center items-center">
				<a href="https://github.com/{answer.user}">
					{answer.user}
				</a>
			</div>

			<a href="https://github.com/{answer.user}">
				<img
					class="w-8 h-8 rounded-full ml-3"
					src={'https://github.com/' + answer.user + '.png'}
					alt={answer.user + ' profile picture'}
				/>
			</a>
		</div>
		<div class="flex flex-1 ml-2">
			<p>{answer.content}</p>
			<!-- <CartaViewer bind:value={answer.content} {carta} />  -->
		</div>

		<div class="flex justify-end">
			{#if $auth.user}
				<button
					class="btn"
					on:click|preventDefault={() => {
						if (showReplyBoxFor != null) {
							showReplyBoxFor = null;
						} else {
							showReplyBoxFor = index;
						}
					}}><span class="icon-[solar--reply-outline] text-primary text-3xl"></span></button
				>
			{/if}
			{#if $auth.user?.username == answer?.user || $auth.user?.admin}
				<button class="btn ml-5" on:click|preventDefault={() => deleteAnswer(answer.id)}>
					<span class="icon-[solar--trash-bin-minimalistic-bold] text-error text-3xl"></span>
				</button>
			{/if}
		</div>

		{#if showReplyBoxFor === index}
			<div class="w-full z-10">
				TODO: reply box I guess
				<!--
				<ReplyBox
					closeCallback={() => {
						showReplyBoxFor = null;
					}}
					bind:unfinishedReply={unfinishedReplies[index]}
					questionId={question}
					sendAnswerCallback={() => {
						showReplyBoxFor = null;
					}}
					parentAuthor={answer.user}
					parentAnswerId={answer.id}
				/>
        -->
			</div>
		{/if}

		<div class="mt-12">
			{#each answer.replies || [] as reply, index}
				<Reply {answer} {reply} {index} />
			{/each}
		</div>
	</div>
</div>
