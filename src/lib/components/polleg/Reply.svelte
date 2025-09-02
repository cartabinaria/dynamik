<script lang="ts">
	import { formatRelativeTime } from '$lib/date';
	import { auth, isAuthenticated } from '$lib/stores/auth';
	import { ANSWER_URL } from '$lib/const';
	import ReplyBox from '$lib/components/polleg/ReplyBox.svelte';
	import { carta } from '$lib/carta-config';
	import { Markdown } from 'carta-md';

	export let answer;
	export let reply;
	export let index;
	export let isLast = false;
	export let reloadAnswers: (() => Promise<void>) | undefined = undefined;
	export let question; // Add question prop for nested replies
	export let onAnswerUpdate: (() => Promise<void>) | undefined = undefined;
	export let depth = 0; // Track nesting depth

	let isDeleting = false;
	let showReplyBox = false;
	let showNestedReplies = false;
	let nestedRepliesContainer: HTMLElement;

	// Reactive variables for auth
	$: user = isAuthenticated($auth) ? $auth.user : null;
	$: canDelete = user && (user.username === reply.user || user.is_admin);

	// Sort nested replies by creation time (newest first)
	$: sortedNestedReplies = reply.replies
		? [...reply.replies].sort((a, b) => {
				if (a.created_at && b.created_at) {
					const dateA = new Date(a.created_at);
					const dateB = new Date(b.created_at);
					return dateB.getTime() - dateA.getTime(); // Newest first
				}
				return b.id - a.id; // Fallback: higher ID first
			})
		: [];

	const deleteReply = async (replyId: number) => {
		if (isDeleting) return; // Prevent double clicks

		if (!confirm('Are you sure you want to delete this reply? This action cannot be undone.')) {
			return; // User cancelled
		}

		isDeleting = true;
		try {
			const res = await fetch(ANSWER_URL(replyId), {
				method: 'DELETE',
				credentials: 'include'
			});

			// Success status codes: 200 (OK), 204 (No Content), 202 (Accepted)
			if (res.ok || res.status === 204) {
				// Reload answers from server to ensure UI is in sync
				if (reloadAnswers) {
					await reloadAnswers();
				}
			} else {
				// Error - try to parse response for error details
				let errorMessage = `Failed to delete reply. Status: ${res.status}`;
				try {
					const errorData = await res.text();
					console.error('Delete failed:', errorMessage, errorData);
					alert(`Failed to delete reply: ${errorMessage}`);
				} catch (parseError) {
					console.error('Delete failed:', errorMessage);
					alert(`Failed to delete reply: ${errorMessage}`);
				}
			}
		} catch (error) {
			console.error('Error deleting reply:', error);
			alert('Network error while deleting reply. Please try again.');
		} finally {
			isDeleting = false;
		}
	};

	// Function to handle new nested reply submission with animation
	const handleNewNestedReply = async (newReplyId: number) => {
		// Open nested replies section if closed
		if (!showNestedReplies) {
			showNestedReplies = true;
		}

		// Wait for DOM update and then scroll to new reply
		setTimeout(() => {
			if (nestedRepliesContainer && newReplyId) {
				const newReply = nestedRepliesContainer.querySelector(`[data-reply-id="${newReplyId}"]`);
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

<!-- Reply with Timeline Design -->
<div class="flex gap-4 w-full" data-reply-id={reply.id}>
	<!-- Timeline Line -->
	<div class="relative flex flex-col items-center">
		<!-- Timeline connector from above (except for first reply) -->
		{#if index > 0}
			<div class="w-0.5 h-4 bg-primary/30"></div>
		{/if}

		<!-- Timeline dot -->
		<div
			class="w-8 h-8 bg-primary/10 border-2 border-primary/30 rounded-full flex items-center justify-center flex-shrink-0"
		>
			<div class="w-2 h-2 bg-primary/60 rounded-full"></div>
		</div>

		<!-- Timeline connector to below (except for last reply) -->
		{#if !isLast}
			<div class="w-0.5 flex-1 bg-primary/30 min-h-[2rem]"></div>
		{/if}
	</div>

	<!-- Reply Content -->
	<div class="flex-1 bg-base-200 backdrop-blur-sm rounded-lg p-4 min-w-0 mr-4 mb-4">
		<!-- Reply Header -->
		<div class="flex items-center justify-between mb-4">
			<div class="flex items-center gap-3">
				<img
					class="w-8 h-8 rounded-full ring-1 ring-base-300/50"
					src={reply.user_avatar_url}
					alt={reply.user + ' profile picture'}
					loading="lazy"
					referrerpolicy="no-referrer"
				/>
				<div class="flex items-center gap-2 text-sm">
					{reply.user}
					<span class="text-base-content/60">•</span>
					<span class="text-base-content/70">
						{formatRelativeTime(reply.created_at)}
					</span>
				</div>
			</div>

			<!-- Delete Button (only for reply owner or admin) -->
			{#if canDelete}
				<button
					class="btn btn-ghost btn-xs text-error hover:btn-error opacity-60 hover:opacity-100"
					on:click|preventDefault={() => deleteReply(reply.id)}
					disabled={isDeleting}
					title="Delete reply"
				>
					<span class="icon-[solar--trash-bin-minimalistic-bold] {isDeleting ? 'opacity-50' : ''}"
					></span>
				</button>
			{/if}
		</div>

		<!-- Reply Content -->
		<div class="leading-normal mb-4">
			<Markdown {carta} value={reply.content} />
		</div>

		<!-- Bottom Actions Bar (similar to Answer component) -->
		{#if depth < 3}
			<!-- Limit nesting to 3 levels for UX -->
			<div class="flex items-center gap-3 text-sm flex-wrap">
				<!-- Nested Replies Button -->
				{#if sortedNestedReplies && sortedNestedReplies.length > 0}
					<button class="btn btn-ghost btn-xs" on:click={() => (showNestedReplies = !showNestedReplies)}>
						{#if showNestedReplies}
							<span class="icon-[solar--alt-arrow-up-outline]"></span>
							Hide replies
						{:else}
							<span class="icon-[solar--alt-arrow-down-outline]"></span>
							{sortedNestedReplies.length} Replies
						{/if}
					</button>
					<div class="divider divider-horizontal mx-0"></div>
				{/if}

				<!-- Reply Button -->
				{#if user}
					<button
						class="btn btn-ghost btn-xs"
						on:click|preventDefault={() => {
							showReplyBox = !showReplyBox;
						}}
					>
						<span class="icon-[solar--reply-outline]"></span>
						Reply
					</button>
				{/if}
			</div>
		{/if}

		<!-- Reply Box for nested replies -->
		{#if showReplyBox && depth < 3}
			<div class="mt-4 pt-4 border-t border-base-300/50 w-full">
				<ReplyBox
					closeCallback={() => {
						showReplyBox = false;
					}}
					questionId={question}
					sendAnswerCallback={() => {
						showReplyBox = false;
					}}
					parentAnswerId={reply.id}
					{reloadAnswers}
					onSubmitSuccess={handleNewNestedReply}
				/>
			</div>
		{/if}
	</div>

	<!-- Nested Replies Section -->
	{#if showNestedReplies && sortedNestedReplies && sortedNestedReplies.length > 0}
		<div class="ml-4 mt-2">
			<div class="flex flex-col" bind:this={nestedRepliesContainer}>
				{#each sortedNestedReplies as nestedReply, nestedIndex}
					<svelte:self
						{answer}
						reply={nestedReply}
						index={nestedIndex}
						isLast={nestedIndex === sortedNestedReplies.length - 1}
						{reloadAnswers}
						{question}
						{onAnswerUpdate}
						depth={depth + 1}
					/>
				{/each}
			</div>
		</div>
	{/if}
</div>
