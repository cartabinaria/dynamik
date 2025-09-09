<script lang="ts">
	let {
		index,
		isLast = false,
		hasNestedReplies = false,
		expanded = false,
		hasMore = false,
		isLoadingMore = false,
		onToggleExpanded = undefined,
		onLoadMore = undefined
	}: {
		index: number;
		isLast?: boolean;
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
	<div class="w-8 h-8 bg-primary/10 border-2 border-primary/30 rounded-full flex items-center justify-center flex-shrink-0 group-hover:bg-primary/15 group-hover:border-primary/40 transition-all duration-200">
		<div class="w-2 h-2 bg-primary/60 rounded-full group-hover:bg-primary/80 transition-colors"></div>
	</div>

	<!-- Timeline connector to below - with controls -->
	{#if !isLast || (expanded && hasNestedReplies) || hasMore}
		<div class="relative w-0.5 flex-1 bg-primary/30 group-hover:bg-primary/40 transition-colors min-h-[2rem]">
			<!-- Expand/Collapse Control for nested replies -->
			{#if hasNestedReplies && onToggleExpanded}
				<button
					class="timeline-expand-btn absolute left-1/2 top-4 transform -translate-x-1/2 w-4 h-4 bg-base-100 border border-primary/40 rounded-full flex items-center justify-center hover:bg-primary/10 hover:border-primary/60 transition-all duration-200 shadow-sm"
					onclick={onToggleExpanded}
					title={expanded ? 'Collapse replies' : 'Show replies'}
				>
					{#if expanded}
						<span class="icon-[solar--double-alt-arrow-up-outline] text-primary/70 text-[10px]"></span>
					{:else}
						<span class="icon-[solar--double-alt-arrow-down-outline] text-primary/70 text-[10px]"></span>
					{/if}
				</button>
			{/if}

			<!-- Load More Control - positioned lower on the timeline -->
			{#if hasMore && onLoadMore}
				<button
					class="timeline-load-btn absolute left-1/2 bottom-4 transform -translate-x-1/2 w-6 h-6 bg-accent/10 border border-accent/40 rounded-full flex items-center justify-center hover:bg-accent/15 hover:border-accent/60 transition-all duration-200 shadow-sm"
					onclick={onLoadMore}
					disabled={isLoadingMore}
					title="Load deeper conversation levels"
				>
					{#if isLoadingMore}
						<span class="icon-[solar--refresh-bold] text-accent/70 text-xs animate-spin"></span>
					{:else}
						<span class="icon-[solar--double-alt-arrow-down-outline] text-accent/70 text-xs"></span>
					{/if}
				</button>
			{/if}
		</div>
	{/if}
</div>
