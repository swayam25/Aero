<script lang="ts">
    import type { UserData } from "$lib/discord/types";
    import Queue from "./Queue.svelte";

    let { user }: { user: UserData } = $props();
</script>

<!-- Mobile Queue using original Queue component styled for drawer -->
<div class="mobile-queue-wrapper">
    <Queue {user} />
</div>

<style>
    :global(.mobile-queue-wrapper .w-full.rounded-lg.bg-slate-900.md\\:h-full) {
        /* Remove the outer wrapper styling to match drawer theme */
        background-color: transparent !important;
        border-radius: 0 !important;
        width: 100% !important;
        height: 100% !important;
    }

    :global(.mobile-queue-wrapper .flex.w-full.items-center.justify-start.gap-2.p-5) {
        /* Hide the header since drawer provides its own */
        display: none !important;
    }

    :global(.mobile-queue-wrapper #queue) {
        /* Adjust height for mobile drawer context */
        height: 100% !important;
        padding: 0 !important;
    }

    :global(.mobile-queue-wrapper .song-handle) {
        /* Optimize for mobile touch */
        padding: 0.75rem !important;
        margin-bottom: 0.5rem !important;
        background-color: var(--color-slate-900) !important;
        border-radius: 0.5rem !important;
    }

    :global(.mobile-queue-wrapper .song-handle:hover) {
        background-color: var(--color-slate-800) !important;
    }

    :global(.mobile-queue-wrapper .size-15) {
        /* Slightly smaller thumbnails for mobile */
        width: 2.5rem !important;
        height: 2.5rem !important;
    }
</style>
