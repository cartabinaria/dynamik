<script lang="ts">
	import { formatRelativeTime } from '$lib/date';
	import { auth, isAuthenticated } from '$lib/stores/auth';
	import { ANSWER_URL } from '$lib/const';

	export let answer;
	export let reply;
	export let index;
	export let isLast = false;
	export let reloadAnswers: (() => Promise<void>) | undefined = undefined;

	let isDeleting = false;

	// Reactive variables for auth
	$: user = isAuthenticated($auth) ? $auth.user : null;
	$: canDelete = user && (user.id === reply.user_id || user.is_admin);

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
		<div class="leading-normal">
			{reply.content}
		</div>
	</div>
</div>
