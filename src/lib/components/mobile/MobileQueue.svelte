<script lang="ts">
    import type { UserData } from "$lib/discord/types";
    import Queue from "../Queue.svelte";

    let {
        user,
        isRearrangeMode = $bindable(false),
        onRearrangeModeExit,
    }: { user: UserData | null; isRearrangeMode?: boolean; onRearrangeModeExit?: () => void } = $props();
</script>

<!-- Mobile Queue using original Queue component styled for drawer -->
<div class="mobile-queue-wrapper">
    <Queue {user} bind:isRearrangeMode {onRearrangeModeExit} />
</div>

<style>
    :global(.mobile-queue-wrapper > div) {
        /* Remove the outer wrapper styling to match drawer theme */
        background-color: transparent !important;
        border-radius: 0 !important;
        width: 100% !important;
        height: 100% !important;
    }

    :global(.mobile-queue-wrapper > div > div:first-child) {
        /* Hide the header since drawer provides its own */
        display: none !important;
    }

    :global(.mobile-queue-wrapper > div) {
        /* Remove padding since it's inside drawer */
        padding: 0 !important;
    }

    :global(.mobile-queue-wrapper .song-handle) {
        /* Optimize for mobile touch */
        margin-bottom: 0.5rem !important;
        background-color: var(--color-slate-900) !important;
    }

    :global(.mobile-queue-wrapper .song-handle:hover) {
        background-color: var(--color-slate-800) !important;
    }

    :global(.mobile-queue-wrapper .size-15) {
        /* Slightly smaller thumbnails for mobile */
        width: 2.5rem !important;
        height: 2.5rem !important;
    }

    /* Target the scrollable content container */
    :global(.mobile-queue-wrapper > div > div:last-child) {
        height: auto !important;
        overflow-x: hidden !important;
        overflow-y: hidden !important;
        padding: 0 !important;
    }
</style>
