<!-- 
SPDX-FileCopyrightText: 2025 Alice Benatti <alice17bee@gmail.com>

SPDX-License-Identifier: AGPL-3.0-or-later
-->

<script lang="ts">
	let {
		index,
		last = false,
		hasNestedReplies = false,
		expanded = false,
		hasMore = false,
		isLoadingMore = false,
		onToggleExpanded = undefined,
		onLoadMore = undefined
	}: {
		index: number;
		last?: boolean;
		hasNestedReplies?: boolean;
		expanded?: boolean;
		hasMore?: boolean;
		isLoadingMore?: boolean;
		onToggleExpanded?: (() => void) | undefined;
		onLoadMore?: (() => void) | undefined;
	} = $props();
</script>

<!-- Timeline Structure -->
<div class="relative flex flex-col items-center">
	<!-- Timeline connector from above (except for first reply) -->
	{#if index > 0}
		<div class="w-0.5 h-4 bg-primary/30 group-hover:bg-primary/40 transition-colors"></div>
	{/if}

	<!-- Timeline dot - always consistent -->
	<div
		class="w-8 h-8 bg-primary/10 border-2 border-primary/30 rounded-full flex items-center justify-center flex-shrink-0 group-hover:bg-primary/15 group-hover:border-primary/40 transition-all duration-200"
	>
		<div
			class="w-2 h-2 bg-primary/60 rounded-full group-hover:bg-primary/80 transition-colors"
		></div>
	</div>

	{#if !last || hasNestedReplies || hasMore}
		<div
			class="relative w-0.5 flex-1 bg-primary/30 group-hover:bg-primary/40 transition-colors min-h-1/2"
		>
			{#if (hasNestedReplies || hasMore) && (onToggleExpanded || onLoadMore)}
				<button
					class="timeline-action-btn absolute left-1/2 bottom-6 transform -translate-x-1/2 w-6 h-6 bg-base-100 border rounded-full flex items-center justify-center hover:bg-primary/10 transition-all duration-200 shadow-sm
				       {hasMore
						? 'border-accent/40 hover:border-accent/60'
						: 'border-primary/40 hover:border-primary/60'}"
					onclick={() => {
						if (hasMore && onLoadMore) {
							onLoadMore();
						} else if (onToggleExpanded) {
							onToggleExpanded();
						}
					}}
					disabled={isLoadingMore}
					title={hasMore ? 'Load more replies' : expanded ? 'Collapse replies' : 'Expand replies'}
				>
					{#if isLoadingMore}
						<span class="loading loading-spinner text-accent/70 text-lg animate-spin"></span>
					{:else if hasMore}
						<span class="icon-[solar--double-alt-arrow-down-outline] text-accent/70 text-lg"></span>
					{:else if expanded}
						<span class="icon-[solar--double-alt-arrow-up-outline] text-primary/70 text-lg"></span>
					{:else}
						<span class="icon-[solar--double-alt-arrow-down-outline] text-primary/70 text-lg"
						></span>
					{/if}
				</button>
			{/if}
		</div>
	{/if}
</div>
