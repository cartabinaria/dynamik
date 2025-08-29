<script lang="ts">
	import { ANSWER_URL, VOTE_URL } from '$lib/const';
	import Reply from '$lib/components/polleg/Reply.svelte';
	import { auth, isAuthenticated } from '$lib/stores/auth';
	import ReplyBox from '$lib/components/polleg/ReplyBox.svelte';

	export let answer;
	export let index;
	export let question;
	export let data; // Add data prop for question data
	export let reloadAnswers: (() => Promise<void>) | undefined = undefined;

	$: showReplyBoxFor = null;
	let unfinishedReplies: string[] = [];
	let isDeleting = false;

	// Reactive variables for auth
	$: user = isAuthenticated($auth) ? $auth.user : null;

	const deleteAnswer = async (id: number) => {
		if (isDeleting) return; // Prevent double clicks
		
		isDeleting = true;
		try {
			const res = await fetch(ANSWER_URL(id), {
				method: 'DELETE',
				credentials: 'include'
			});

			if (res.status === 200) {
				// Reload answers from server to ensure UI is in sync
				if (reloadAnswers) {
					await reloadAnswers();
				} else {
					// Fallback: update local data if reload function not available
					const newAns = data?.answers?.filter(function (item: any) {
						return item.id != id;
					});
					data.answers = newAns;
				}
			} else {
				// Error - try to parse response for error details
				let errorMessage = `Failed to delete answer. Status: ${res.status}`;
				try {
					const errorData = await res.text();
					console.error('Delete failed:', errorMessage, errorData);
				} catch (parseError) {
					console.error('Delete failed:', errorMessage);
				}
			}
		} catch (error) {
			console.error('Error deleting answer:', error);
		} finally {
			isDeleting = false;
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
				<a href="https://github.com/{answer.user}" target="_blank" rel="noopener noreferrer">
					{answer.user}
				</a>
			</div>

			<a href="https://github.com/{answer.user}" target="_blank" rel="noopener noreferrer">
				<img
					class="w-8 h-8 rounded-full ml-3"
					src={'https://github.com/' + answer.user + '.png'}
					alt={answer.user + ' profile picture'}
					loading="lazy"
					referrerpolicy="no-referrer"
				/>
			</a>
		</div>
		<div class="flex flex-1 ml-2">
			<p>{answer.content}</p>
			<!-- <CartaViewer bind:value={answer.content} {carta} />  -->
		</div>

		<div class="flex justify-end">
			{#if user}
				<button
					class="btn"
					aria-label="Reply to this answer"
					on:click|preventDefault={() => {
						if (showReplyBoxFor != null) {
							showReplyBoxFor = null;
						} else {
							showReplyBoxFor = index;
						}
					}}><span class="icon-[solar--reply-outline] text-primary text-3xl"></span></button
				>
			{/if}
			{#if user?.username == answer?.user || user?.admin}
				<button 
					class="btn ml-5" 
					aria-label="Delete this answer"
					on:click|preventDefault={() => deleteAnswer(answer.id)}
					disabled={isDeleting}
				>
					<span class="icon-[solar--trash-bin-minimalistic-bold] text-error text-3xl {isDeleting ? 'opacity-50' : ''}"></span>
					{#if isDeleting}
						<span class="text-sm ml-1">Deleting...</span>
					{/if}
				</button>
			{/if}
		</div>

		{#if showReplyBoxFor === index}
			<div class="w-full z-10">
				<!-- TODO: broken submit -->
				
				<ReplyBox
					closeCallback={() => {
						showReplyBoxFor = null;
					}}
					bind:unfinishedReply={unfinishedReplies[index]}
					questionId={question}
					sendAnswerCallback={() => {
						showReplyBoxFor = null;
					}}
					parentAnswerId={answer.id}
					{reloadAnswers}
				/>
       
			</div>
		{/if}

		<div class="mt-12">
			{#each answer.replies || [] as reply, index}
				<Reply {answer} {reply} {index} />
			{/each}
		</div>
	</div>
</div>
