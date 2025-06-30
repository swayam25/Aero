<script lang="ts">
    import { goto } from "$app/navigation";
    import { createPlaylistActions, openCtxMenu } from "$lib/ctxmenu";
    import type { InsertPlaylist } from "$lib/db/schema";
    import type { UserData } from "$lib/discord/types";
    import SolarMusicLibraryLinear from "~icons/solar/music-library-linear";
    import Tooltip from "./ui/Tooltip.svelte";

    let { user, playlists }: { user: UserData; playlists: InsertPlaylist[] } = $props();
</script>

<div class="flex h-full w-20 flex-col items-center justify-start rounded-lg bg-slate-900">
    <Tooltip side="right" class="my-5">
        {#snippet trigger()}
            <a href="/playlist" class="cursor-pointer opacity-80 transition-opacity hover:opacity-100">
                <SolarMusicLibraryLinear class="size-8" />
            </a>
        {/snippet}
        {#snippet content()}
            Playlists
        {/snippet}
    </Tooltip>

    <div class="flex h-[calc(100vh-238px)] flex-col items-center justify-start gap-5 overflow-y-auto" style="scrollbar-width: none;">
        {#each playlists as playlist}
            <Tooltip side="right">
                {#snippet trigger()}
                    <!-- Using <button> here breaks the tooltip, which leads the app to crash -->
                    <div
                        role="button"
                        tabindex="0"
                        aria-label={playlist.name || "Unnamed playlist"}
                        class="size-15 cursor-pointer rounded-lg bg-slate-800 bg-cover transition-transform"
                        style="background-image: {playlist.cover ? `url(${playlist.cover})` : 'none'};"
                        onclick={() => goto(`/playlist/${user?.id}/${playlist.id}`)}
                        onkeydown={(e) => {
                            if (e.key === "Enter" || e.key === " ") {
                                e.preventDefault();
                                goto(`/playlist/${user?.id}/${playlist.id}`);
                            }
                        }}
                        oncontextmenu={(e) => {
                            e.preventDefault();
                            const actions = createPlaylistActions({ name: playlist.name || "Unnamed playlist", id: playlist.id ?? "" }, user?.id);
                            openCtxMenu(e, actions);
                        }}
                    ></div>
                {/snippet}
                {#snippet content()}
                    {playlist.name || "Unnamed playlist"}
                {/snippet}
            </Tooltip>
        {/each}
    </div>
</div>
