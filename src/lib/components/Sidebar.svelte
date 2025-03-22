<script lang="ts">
    import type { UserData } from "$lib/discord/types";
    import SolarMusicLibraryLinear from "~icons/solar/music-library-linear";
    import Tooltip from "./Tooltip.svelte";

    let { user }: { user: UserData } = $props();
</script>

<div class="flex size-full w-20 flex-col items-center justify-start gap-5 rounded-lg bg-slate-900 p-5 *:cursor-pointer">
    <Tooltip side="right">
        {#snippet trigger()}
            <a href="/playlist" class="opacity-80 transition-opacity hover:opacity-100">
                <SolarMusicLibraryLinear class="size-8" />
            </a>
        {/snippet}
        {#snippet content()}
            Playlists
        {/snippet}
    </Tooltip>
</div>
