<script lang="ts">
	import { formatRelativeTime } from '$lib/date';
	import { auth, isAuthenticated } from '$lib/stores/auth';
	import { ANSWER_URL, ANSWERS_REPLIES_URL } from '$lib/const';
	import ReplyBox from '$lib/components/polleg/ReplyBox.svelte';
	import Timeline from '$lib/components/polleg/Timeline.svelte';
	import { Markdown, Carta } from 'carta-md';
	import { getCartaConfig } from '$lib/carta-config';
	import { tick, untrack } from 'svelte';
	import Reply from './Reply.svelte'; // Self-import for recursive rendering
	import ReportAnswer from './ReportAnswer.svelte';

	const carta = new Carta(getCartaConfig());

	// Props using Svelte 5 $props()
	let {
		answer,
		reply,
		index,
		isLast = false,
		reloadAnswers = undefined,
		question, // Add question prop for nested replies
		onAnswerUpdate = undefined,
		depth = 0, // Track nesting depth
		parentForceUpdate = 0 // Force update from parent component
	}: {
		answer: any;
		reply: any;
		index: number;
		isLast?: boolean;
		reloadAnswers?: (() => Promise<void>) | undefined;
		question?: any;
		onAnswerUpdate?: (() => Promise<void>) | undefined;
		depth?: number;
		parentForceUpdate?: number;
	} = $props();

	// Svelte 5 state management
	let isDeleting = $state(false);
	let showReplyBox = $state(false);
	let showNestedReplies = $state(false);

	// State for nested replies
	let allNestedReplies = $state<any[]>([]);
	let hasLoadedDeepLevels = $state(false); // Track if we've manually loaded deep levels
	let isLoadingDeepLevels = $state(false); // Track if we're currently loading deeper levels

	// Track initialization to prevent infinite loops
	let isInitialized = false;

	// Reactive variables for auth
	let user = $derived(isAuthenticated($auth) ? $auth.user : null);

	// Initialize state from props - simplified
	$effect.pre(() => {
		if (!isInitialized && !hasLoadedDeepLevels) {
			const newReplies = untrack(() => reply.replies || []);
			allNestedReplies = newReplies;
			isInitialized = true;
		}
	});

	// Derived sorted nested replies
	let sortedNestedReplies = $derived(
		allNestedReplies.length > 0
			? [...allNestedReplies].sort((a, b) => {
					if (a.created_at && b.created_at) {
						const dateA = new Date(a.created_at);
						const dateB = new Date(b.created_at);
						return dateA.getTime() - dateB.getTime(); // Oldest first
					}
					return a.id - b.id; // Fallback: lower ID first
				})
			: []
	);

	// Timeline state - derived from nested replies (after sortedNestedReplies is defined)
	let hasNestedReplies = $derived(sortedNestedReplies.length > 0);
	let hasMoreToLoad = $derived(reply.replies && reply.replies.length > 0 && !hasLoadedDeepLevels);

	// Simplified function to load deeper levels
	const loadDeeperLevels = async () => {
		if (isLoadingDeepLevels) return;

		isLoadingDeepLevels = true;
		try {
			const response = await fetch(ANSWERS_REPLIES_URL(reply.id), {
				credentials: 'include'
			});

			if (response.ok) {
				const freshData = await response.json();

				// Update nested replies with fresh data
				if (Array.isArray(freshData)) {
					allNestedReplies = freshData;
				} else if (freshData && freshData.replies) {
					allNestedReplies = freshData.replies;
				}

				// Mark as loaded and auto-expand
				hasLoadedDeepLevels = true;
				showNestedReplies = true; // Force expand when loading deeper levels
			} else {
				console.error('Failed to load deeper levels:', response.status);
			}
		} catch (error) {
			console.error('Error loading deeper levels:', error);
		} finally {
			isLoadingDeepLevels = false;
		}
	};

	// Function to handle new nested reply submission
	const handleNewNestedReply = async (newReplyId: number) => {
		// Open nested replies section if closed
		if (!showNestedReplies) {
			showNestedReplies = true;
		}

		// Load fresh data from the specific endpoint to get all nested levels
		try {
			const response = await fetch(ANSWERS_REPLIES_URL(reply.id), {
				credentials: 'include'
			});

			if (response.ok) {
				const freshData = await response.json();

				// Check if we got an array of replies or a single reply object with nested replies
				if (Array.isArray(freshData)) {
					allNestedReplies = freshData;
				} else if (freshData && freshData.replies) {
					allNestedReplies = freshData.replies;
				} else {
					console.warn(`Unexpected response format:`, freshData);
					allNestedReplies = [];
				}

				// Mark that we've loaded deep levels to prevent props from overriding
				hasLoadedDeepLevels = true;

				// Scroll to new reply after DOM update
				setTimeout(() => {
					const newReplyElement = document.querySelector(`[data-reply-id="${newReplyId}"]`);
					if (newReplyElement) {
						newReplyElement.scrollIntoView({
							behavior: 'smooth',
							block: 'center'
						});
						newReplyElement.classList.add('animate-pulse');
						setTimeout(() => {
							newReplyElement.classList.remove('animate-pulse');
						}, 2000);
					}
				}, 300);
			} else {
				console.error('Failed to refresh nested replies:', response.status);
			}
		} catch (error) {
			console.error('Error refreshing nested replies:', error);
		}
	};

	// Timeline callback functions
	const toggleNestedReplies = () => {
		showNestedReplies = !showNestedReplies;
	};

	const handleLoadMore = () => {
		loadDeeperLevels();
	};

	// Element for the reply container
	let replyContainer = $state<HTMLDivElement>();

	const deleteReply = async (replyId: number) => {
		if (isDeleting) return;

		isDeleting = true;
		try {
			const res = await fetch(ANSWER_URL(replyId), {
				method: 'DELETE',
				credentials: 'include'
			});

			if (res.ok || res.status === 204) {
				if (reloadAnswers) {
					await reloadAnswers();
				}
			} else {
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

	function reportReply(replyId: number) {
		alert('Report functionality is not yet implemented.');
	}
</script>

<!-- Reply with Timeline Design -->
{#key reply.id}
	<div class="flex gap-4 w-full group" data-reply-id={reply.id} bind:this={replyContainer}>
		<!-- Timeline Component -->
		<Timeline
			{index}
			{isLast}
			{hasNestedReplies}
			expanded={showNestedReplies}
			hasMore={hasMoreToLoad}
			isLoadingMore={isLoadingDeepLevels}
			onToggleExpanded={toggleNestedReplies}
			onLoadMore={handleLoadMore}
		/>

		<!-- Reply Content Container -->
		<div class="flex-1 min-w-0 mr-4">
			<!-- Main Reply Content -->
			<div
				class="bg-base-200 backdrop-blur-sm rounded-lg p-4 mb-4 transition-all duration-200 border border-transparent"
			>
				<!-- Reply Header -->
				<div class="flex items-center justify-between mb-4">
					<div class="flex items-center gap-3">
						<img
							class="w-8 h-8 rounded-full ring-1 ring-base-300/50 transition-all"
							src={reply.user_avatar_url}
							alt={reply.user + ' profile picture'}
							loading="lazy"
							referrerpolicy="no-referrer"
						/>
						<div class="flex items-center gap-2 text-sm">
							<span class="font-medium transition-colors">{reply.user}</span>
							<span class="text-base-content/60">•</span>
							<span class="text-base-content/70">
								{formatRelativeTime(reply.created_at)}
							</span>
						</div>
						<ReportAnswer id={reply.id} />
						<!-- Delete Button (only for reply owner or admin) -->
						{#if reply.can_i_delete}
							<button
								class="btn btn-ghost btn-square btn-xs text-error hover:btn-error opacity-60 hover:opacity-100"
								onclick={(e) => {
									e.preventDefault();
									deleteReply(reply.id);
								}}
								disabled={isDeleting}
								title="Delete reply"
								aria-label="Delete reply"
							>
								<span
									class="icon-[solar--trash-bin-minimalistic-bold] text-xl {isDeleting
										? 'opacity-50'
										: ''}"
								></span>
							</button>
						{/if}
					</div>
				</div>

				<!-- Reply Content -->
				<div class="leading-normal mb-4">
					<Markdown {carta} value={reply.content} />
				</div>

				<!-- Bottom Actions Bar (similar to Answer component) -->
				<div class="flex items-center gap-3 text-sm flex-wrap">
					<!-- Reply Button -->
					{#if user}
						<button
							class="btn btn-ghost btn-xs hover:btn-primary hover:text-primary-content transition-all duration-200 group/reply"
							onclick={(e) => {
								e.preventDefault();
								showReplyBox = !showReplyBox;
								// Scroll to bottom of timeline where ReplyBox will appear
								if (showReplyBox) {
									setTimeout(() => {
										const replyBoxElement = document.querySelector(
											`[data-reply-id="${reply.id}"] .reply-box-container`
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
							<span
								class="icon-[solar--reply-outline] group-hover/reply:rotate-12 transition-transform"
							></span>
							Reply
						</button>
					{/if}
				</div>
			</div>

			<!-- Nested Replies Section - simplified recursive rendering -->
			{#if showNestedReplies && sortedNestedReplies && sortedNestedReplies.length > 0}
				<div class="ml-8 animate-in slide-in-from-left-4 duration-300">
					{#each sortedNestedReplies as nestedReply, nestedIndex (nestedReply.id)}
						<div
							class="animate-in fade-in slide-in-from-top-2 duration-300"
							style="animation-delay: {nestedIndex * 50}ms"
						>
							<Reply
								{answer}
								reply={nestedReply}
								index={nestedIndex}
								isLast={nestedIndex === sortedNestedReplies.length - 1}
								{reloadAnswers}
								{question}
								{onAnswerUpdate}
								depth={depth + 1}
								parentForceUpdate={0}
							/>
						</div>
					{/each}
				</div>
			{/if}

			<!-- Reply Box at the bottom of this reply's timeline -->
			{#if showReplyBox}
				<div class="reply-box-container ml-8">
					<div
						class="bg-base-200/40 backdrop-blur-sm rounded-lg p-4 border border-primary/20 shadow-lg animate-in slide-in-from-top-2 duration-300"
					>
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
				</div>
			{/if}
		</div>
	</div>
{/key}
