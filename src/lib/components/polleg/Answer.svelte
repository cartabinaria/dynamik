<!-- 
SPDX-FileCopyrightText: 2024 Luca Tagliavini <luca@teapot.ovh>
SPDX-FileCopyrightText: 2025 Alice Benatti <alice17bee@gmail.com>
SPDX-FileCopyrightText: 2025 Samuele Musiani <samu@teapot.ovh>

SPDX-License-Identifier: AGPL-3.0-or-later
-->

<script lang="ts">
	import { ANSWER_URL, VOTE_URL } from '$lib/const';
	import Reply from '$lib/components/polleg/Reply.svelte';
	import { auth, isAuthenticated } from '$lib/stores/auth';
	import ReplyBox from '$lib/components/polleg/ReplyBox.svelte';
	import { formatRelativeTime } from '$lib/date';
	import { Markdown } from 'carta-md';
	import { carta } from '$lib/carta-config';
	import ReportAnswer from '$lib/components/polleg/ReportAnswer.svelte';

	let { answer, index, question, data, reloadAnswers, onAnswerUpdate } = $props<{
		answer: any;
		index: number;
		question: any;
		data: any;
		reloadAnswers?: () => Promise<void>;
		onAnswerUpdate?: () => Promise<void>;
	}>();

	let showReplyBoxFor: any = $state(null);
	let isDeleting = $state(false);
	let showReplies = $state(false);
	let repliesContainer: HTMLElement | null = $state(null);

	// Reactive variables for auth
	let user = $state(isAuthenticated($auth) ? $auth.user : null);

	// Sort replies by creation time (oldest first - chronological order)
	let sortedReplies = $derived(() =>
		answer.replies
			? [...answer.replies].sort((a, b) => {
					// Primary sort: by created_at if available
					if (a.created_at && b.created_at) {
						const dateA = new Date(a.created_at);
						const dateB = new Date(b.created_at);
						return dateA.getTime() - dateB.getTime(); // Chronological: oldest first
					}
					// Fallback: sort by ID (assuming sequential IDs) - oldest first
					return a.id - b.id; // Lower ID first
				})
			: []
	);

	const deleteAnswer = async (id: number) => {
		if (isDeleting) return; // Prevent double clicks

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
		if (data?.answers[index].i_voted == newVote) newVote = 0;

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
			let oldVote = data.answers[index].i_voted;
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

		if (reloadAnswers) {
			await reloadAnswers();
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

<div
	data-answer-id={answer.id}
	class="w-full card bg-base-200/30 shadow-lg rounded-xl transition-all duration-300"
>
	<div class="card-body p-0 md:p-4 w-full">
		<!-- Answer Layout: Left voting, Right content -->
		<div class="flex gap-1 md:gap-6 w-full">
			<!-- Left Voting Column -->
			<div class="flex flex-col items-center md:gap-3 md:min-w-[4rem] pt-2">
				<!-- Upvote Button -->
				<button
					class={'btn btn-circle btn-sm transition-colors ' +
						(answer?.i_voted == 1 ? 'btn-success' : 'btn-ghost hover:btn-success')}
					onclick={() => vote(index, answer.id, 1)}
					title="Upvote this answer"
					aria-label="Upvote this answer"
				>
					<span class="icon-[material-symbols--arrow-upward] text-xl"></span>
				</button>

				<!-- Vote Count -->
				<span class="text-lg font-bold py-1 min-w-[2rem] text-center"
					>{answer.upvotes - answer.downvotes}</span
				>

				<!-- Downvote Button -->
				<button
					class={'btn btn-circle btn-sm transition-colors ' +
						(answer?.i_voted == -1 ? 'btn-error' : 'btn-ghost hover:btn-error')}
					onclick={() => vote(index, answer.id, -1)}
					title="Downvote this answer"
					aria-label="Downvote this answer"
				>
					<span class="icon-[material-symbols--arrow-downward] text-xl"></span>
				</button>
			</div>

			<!-- Right Content Column -->
			<div class="flex-1 min-w-0">
				<!-- Header with user info and timestamp -->
				<div class="flex items-center justify-between mb-4 flex-wrap">
					<div class="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-2 mt-4">
						<div class="flex items-center gap-2 text-base">
							<img
								class="w-6 h-6 md:w-10 md:h-10 rounded-full ring-2 ring-base-300/50"
								src={answer.user_avatar_url}
								alt={answer.user + ' profile picture'}
								loading="lazy"
								referrerpolicy="no-referrer"
							/>
							{answer.user}
						</div>
						<div>
							<span class="text-base-content/70 text-sm sm:text-base">
								<span class="text-base-content/60">•</span>
								{formatRelativeTime(answer.created_at)}
							</span>
						</div>
					</div>
					<div class="flex flex-end justify-end items-center gap-2">
						<ReportAnswer id={answer.id} />

						<!-- Delete Button (Far right for safety) -->
						{#if answer.can_i_delete}
							<button
								class="btn btn-ghost btn-square btn-sm text-error hover:btn-error"
								onclick={() => deleteAnswer(answer.id)}
								disabled={isDeleting}
							>
								<span
									class="icon-[solar--trash-bin-minimalistic-bold] text-xl {isDeleting
										? 'opacity-50'
										: ''}"
								></span>
								{#if isDeleting}
									Deleting...
								{/if}
							</button>
						{/if}
					</div>
				</div>

				<!-- Answer Content -->
				<div class="leading-normal mb-4">
					<Markdown {carta} value={answer.content ?? ''} />
				</div>

				<!-- Bottom Actions Bar -->
				<div class="flex items-center gap-3 text-sm flex-wrap">
					<!-- Replies Button -->
					{#if sortedReplies().length > 0}
						<button class="btn btn-ghost btn-sm" onclick={() => (showReplies = !showReplies)}>
							{#if showReplies}
								<span class="icon-[solar--alt-arrow-up-outline]"></span>
								Hide replies
							{:else}
								<span class="icon-[solar--alt-arrow-down-outline]"></span>
								{sortedReplies().length} Replies
							{/if}
						</button>
						<div class="divider divider-horizontal mx-0"></div>
					{/if}

					<!-- Reply Button -->
					{#if user}
						<button
							class="btn btn-ghost btn-sm"
							onclick={(e) => {
								e.preventDefault();
								if (showReplyBoxFor != null) {
									showReplyBoxFor = null;
								} else {
									showReplyBoxFor = index;
									// Scroll to bottom where ReplyBox will appear
									setTimeout(() => {
										const replyBoxElement = document.querySelector(
											`[data-answer-id="${answer.id}"] .reply-box-container`
										);
										if (replyBoxElement) {
											replyBoxElement.scrollIntoView({
												behavior: 'smooth',
												block: 'center'
											});
										}
									}, 100);
								}
							}}
						>
							<span class="icon-[solar--reply-outline]"></span>
							Reply
						</button>
						<div class="divider divider-horizontal mx-0"></div>
					{/if}
				</div>

				<!-- Replies Section with Timeline -->
				{#if showReplies && sortedReplies().length > 0}
					<div class="mt-8 pt-6 w-full">
						<div class="flex flex-col" bind:this={repliesContainer}>
							{#each sortedReplies() as reply, replyIndex (reply.id)}
								<Reply
									{answer}
									{reply}
									index={replyIndex}
									isLast={replyIndex === sortedReplies().length - 1}
									{reloadAnswers}
									{question}
									{onAnswerUpdate}
									depth={0}
								/>
							{/each}
						</div>
					</div>
				{/if}

				<!-- Reply Box at the bottom of the replies timeline -->
				{#if showReplyBoxFor === index}
					<div class="reply-box-container mt-4 w-full">
						<ReplyBox
							closeCallback={() => {
								showReplyBoxFor = null;
							}}
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
			</div>
		</div>
	</div>
</div>
