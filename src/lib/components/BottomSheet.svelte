<script lang="ts">
    import { createEventDispatcher } from 'svelte';

    let { open = $bindable(false) }: { open?: boolean } = $props();
    const dispatch = createEventDispatcher();

    let sheet: HTMLDivElement;
    let startY = 0;
    let currentY = 0;
    let translateY = $state(100); // % (100 = closed, 0 = completamente open)

    function handleTouchStart(e: TouchEvent) {
        startY = e.touches[0].clientY;
    }

    function handleTouchMove(e: TouchEvent) {
        currentY = e.touches[0].clientY;
        const diff = currentY - startY;
        const newTranslate = Math.min(100, Math.max(0, translateY + (diff / window.innerHeight) * 100));
        translateY = newTranslate;
    }

    function handleTouchEnd() {
        if (translateY > 50) {
            translateY = 100;
            open = false;
            dispatch('close');
        } else {
            translateY = 0;
            open = true;
        }
    }

    $effect(() => {
        if (open) {
            translateY = 0;
        } else {
            translateY = 100;
        }
    });
</script>

<div
    bind:this={sheet}
    class="fixed inset-x-0 bottom-0 z-50 bg-base-200/30 rounded-t-2xl shadow-lg transition-transform duration-300"
    style="transform: translateY({translateY}%);"
    ontouchstart={handleTouchStart}
    ontouchmove={handleTouchMove}
    ontouchend={handleTouchEnd}
>
    <div class="flex justify-center py-2">
        <div class="w-12 h-1.5 bg-gray-400 rounded-full"></div>
    </div>
    <div class="p-4 max-h-[70vh] overflow-y-auto">
        <slot />
    </div>
</div>