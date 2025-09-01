<script lang="ts">
	import { ANSWER_URL, VOTE_URL } from '$lib/const';
	import Reply from '$lib/components/polleg/Reply.svelte';
	import { auth, isAuthenticated } from '$lib/stores/auth';
	import ReplyBox from '$lib/components/polleg/ReplyBox.svelte';
	import { formatRelativeTime } from '$lib/date';

	export let answer;
	export let index;
	export let question;
	export let data; // Add data prop for question data
	export let reloadAnswers: (() => Promise<void>) | undefined = undefined;
	export let onAnswerUpdate: (() => Promise<void>) | undefined = undefined;

	let showReplyBoxFor = null;
	let unfinishedReplies: string[] = [];
	let isDeleting = false;
	let showReplies = false;
	let repliesContainer: HTMLElement;

	// Reactive variables for auth
	$: user = isAuthenticated($auth) ? $auth.user : null;

	// Sort replies by creation time (newest first, oldest last)
	$: sortedReplies = answer.replies
		? [...answer.replies].sort((a, b) => {
				// Primary sort: by created_at if available
				if (a.created_at && b.created_at) {
					const dateA = new Date(a.created_at);
					const dateB = new Date(b.created_at);
					return dateB.getTime() - dateA.getTime(); // Inverted: newest first
				}
				// Fallback: sort by ID (assuming sequential IDs) - newest first
				return b.id - a.id; // Inverted: higher ID first
			})
		: [];

	const deleteAnswer = async (id: number) => {
		if (isDeleting) return; // Prevent double clicks

		// Check if answer has replies and ask for confirmation
		if (sortedReplies && sortedReplies.length > 0) {
			const confirmMessage = `This answer has ${sortedReplies.length} reply(ies). Are you sure you want to delete it? This action cannot be undone.`;
			if (!confirm(confirmMessage)) {
				return; // User cancelled
			}
		}

		isDeleting = true;
		try {
			const res = await fetch(ANSWER_URL(id), {
				method: 'DELETE',
				credentials: 'include'
			});

			// Success status codes: 200 (OK), 204 (No Content), 202 (Accepted)
			if (res.ok || res.status === 204) {
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
					alert(`Failed to delete answer: ${errorMessage}`);
				} catch (parseError) {
					console.error('Delete failed:', errorMessage);
					alert(`Failed to delete answer: ${errorMessage}`);
				}
			}
		} catch (error) {
			console.error('Error deleting answer:', error);
			alert('Network error while deleting answer. Please try again.');
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

	// Function to handle new reply submission with animation
	const handleNewReply = async (newReplyId: number) => {
		// Open replies section if closed
		if (!showReplies) {
			showReplies = true;
		}

		// Wait for DOM update and then scroll to new reply
		setTimeout(() => {
			if (repliesContainer && newReplyId) {
				const newReply = repliesContainer.querySelector(`[data-reply-id="${newReplyId}"]`);
				if (newReply) {
					newReply.scrollIntoView({
						behavior: 'smooth',
						block: 'center'
					});

					// Add a brief highlight animation
					newReply.classList.add('animate-pulse');
					setTimeout(() => {
						newReply.classList.remove('animate-pulse');
					}, 2000);
				}
			}
		}, 300);
	};
</script>

<!-- Answer Card with Glass Effect -->
<div
	data-answer-id={answer.id}
	class="m-4 w-full card bg-base-200/30 backdrop-blur-md border border-base-300/30 shadow-lg rounded-xl transition-all duration-300"
>
	<div class="card-body p-4">
		<!-- Answer Layout: Left voting, Right content -->
		<div class="flex gap-8 w-full">
			<!-- Left Voting Column -->
			<div class="flex flex-col items-center gap-3 min-w-[4rem] pt-2">
				<!-- Upvote Button -->
				<button
					class={'btn btn-circle btn-sm transition-colors ' +
						(answer?.vote == 1 ? 'btn-success' : 'btn-ghost hover:btn-success')}
					on:click={() => vote(index, answer.id, 1)}
				>
					<span class="icon-[material-symbols--arrow-upward] text-xl"></span>
				</button>

				<!-- Vote Count -->
				<span class="text-xl font-bold py-1 min-w-[2rem] text-center"
					>{answer.upvotes - answer.downvotes}</span
				>

				<!-- Downvote Button -->
				<button
					class={'btn btn-circle btn-sm transition-colors ' +
						(answer?.vote == -1 ? 'btn-error' : 'btn-ghost hover:btn-error')}
					on:click={() => vote(index, answer.id, -1)}
				>
					<span class="icon-[material-symbols--arrow-downward] text-xl"></span>
				</button>
			</div>

			<!-- Right Content Column -->
			<div class="flex-1 min-w-0">
				<!-- Header with user info and timestamp -->
				<div class="flex items-center gap-4 mb-6">
					<img
						class="w-10 h-10 rounded-full ring-2 ring-base-300/50"
						src={answer.user_avatar_url}
						alt={answer.user + ' profile picture'}
						loading="lazy"
						referrerpolicy="no-referrer"
					/>
					<div class="flex items-center gap-3 text-base">
						{answer.user}
						<span class="text-base-content/60">•</span>
						<span class="text-base-content/70">
							{formatRelativeTime(answer.created_at)}
						</span>
					</div>
				</div>

				<!-- Answer Content -->
				<div class="prose max-w-none mb-8">
					<p class="leading-relaxed text-base">{answer.content}</p>
				</div>

				<!-- Bottom Actions Bar -->
				<div class="flex items-center gap-3 text-sm flex-wrap">
					<!-- Replies Button -->
					{#if sortedReplies && sortedReplies.length > 0}
						<button class="btn btn-ghost btn-sm" on:click={() => (showReplies = !showReplies)}>
							{#if showReplies}
								<span class="icon-[solar--alt-arrow-up-outline]"></span>
								Hide replies
							{:else}
								<span class="icon-[solar--alt-arrow-down-outline]"></span>
								{sortedReplies.length} Replies
							{/if}
						</button>
						<div class="divider divider-horizontal mx-0"></div>
					{/if}

					<!-- Reply Button -->
					{#if user}
						<button
							class="btn btn-ghost btn-sm"
							on:click|preventDefault={() => {
								if (showReplyBoxFor != null) {
									showReplyBoxFor = null;
								} else {
									showReplyBoxFor = index;
								}
							}}
						>
							<span class="icon-[solar--reply-outline]"></span>
							Reply
						</button>
						<div class="divider divider-horizontal mx-0"></div>
					{/if}

					<!-- Delete Button (Far right for safety) -->
					{#if user?.username == answer?.user || user?.admin}
						<button
							class="btn btn-ghost btn-sm text-error hover:btn-error"
							on:click|preventDefault={() => deleteAnswer(answer.id)}
							disabled={isDeleting}
						>
							<span
								class="icon-[solar--trash-bin-minimalistic-bold] {isDeleting ? 'opacity-50' : ''}"
							></span>
							{#if isDeleting}
								Deleting...
							{/if}
						</button>
					{/if}
				</div>

				<!-- Reply Box (attached to main answer) -->
				{#if showReplyBoxFor === index}
					<div class="mt-8 mr-8 pt-6 border-t border-base-300 w-full">
						<ReplyBox
							closeCallback={() => {
								showReplyBoxFor = null;
							}}
							bind:unfinishedReply={unfinishedReplies[index]}
							questionId={question}
							sendAnswerCallback={async () => {
								showReplyBoxFor = null;
								// Call external callback to update parent component
								if (onAnswerUpdate) {
									await onAnswerUpdate();
								}
							}}
							parentAnswerId={answer.id}
							{reloadAnswers}
							onSubmitSuccess={handleNewReply}
						/>
					</div>
				{/if}

				<!-- Replies Section with Timeline -->
				{#if showReplies && sortedReplies && sortedReplies.length > 0}
					<div class="mt-8 pt-6 w-full">
						<div class="flex flex-col" bind:this={repliesContainer}>
							{#each sortedReplies as reply, replyIndex}
								<Reply
									{answer}
									{reply}
									index={replyIndex}
									isLast={replyIndex === sortedReplies.length - 1}
									{reloadAnswers}
								/>
							{/each}
						</div>
					</div>
				{/if}
			</div>
		</div>
	</div>
</div>
