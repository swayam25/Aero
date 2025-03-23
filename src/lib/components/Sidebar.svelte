<script lang="ts">
    import type { InsertPlaylist } from "$lib/db/schema";
    import type { UserData } from "$lib/discord/types";
    import SolarMusicLibraryLinear from "~icons/solar/music-library-linear";
    import Tooltip from "./ui/Tooltip.svelte";

    let { user, playlists }: { user: UserData; playlists: InsertPlaylist[] } = $props();
</script>

<div class="flex size-full w-20 flex-col items-center justify-start gap-5 rounded-lg bg-slate-900 p-5 *:cursor-pointer">
    <Tooltip side="right" class="mb-10">
        {#snippet trigger()}
            <a href="/playlist" class="opacity-80 transition-opacity hover:opacity-100">
                <SolarMusicLibraryLinear class="size-8" />
            </a>
        {/snippet}
        {#snippet content()}
            Playlists
        {/snippet}
    </Tooltip>

    {#each playlists as playlist}
        <Tooltip side="right">
            {#snippet trigger()}
                <div
                    aria-label={playlist.name}
                    class="size-15 cursor-pointer bg-cover rounded-lg bg-slate-800"
                    style="background-image: url({playlist.cover});"
                >
                    <a href="/playlist/{user.id}/{playlist.id}" class="block size-full bg-transparent" aria-label={playlist.name}></a>
                </div>
            {/snippet}
            {#snippet content()}
                {playlist.name}
            {/snippet}
        </Tooltip>
    {/each}
</div>
