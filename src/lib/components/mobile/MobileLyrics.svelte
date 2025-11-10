<script lang="ts">
    import Lyrics from "../Lyrics.svelte";
</script>

<!-- Mobile Lyrics using original Lyrics component styled for drawer -->
<div class="mobile-lyrics-wrapper">
    <Lyrics />
</div>

<style>
    :global(.mobile-lyrics-wrapper > div) {
        /* Remove the outer wrapper styling to match drawer theme */
        background-color: transparent !important;
        border-radius: 0 !important;
        width: 100% !important;
        height: 100% !important;
    }

    :global(.mobile-lyrics-wrapper > div > div:first-child) {
        /* Hide the header since drawer provides its own */
        display: none !important;
    }

    :global(.mobile-lyrics-wrapper > div > div:last-child) {
        /* Adjust height for mobile drawer context and improve padding */
        height: 100% !important;
        max-height: 100% !important;
        padding: 0 1rem 1rem 1rem !important;
    }

    :global(.mobile-lyrics-wrapper p) {
        /* Better mobile typography for lyrics */
        line-height: 1.6 !important;
        font-size: 0.95rem !important;
        white-space: pre-line !important;
        text-align: center !important;
    }

    :global(.mobile-lyrics-wrapper > div > div:last-child > div) {
        /* Center empty state content better */
        height: 16rem !important;
        gap: 1rem !important;
    }
</style>
