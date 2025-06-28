<script lang="ts">
    import { goto } from "$app/navigation";
    import { createPlaylistActions, openCtxMenu } from "$lib/ctxmenu";
    import type { InsertPlaylist } from "$lib/db/schema";
    import type { UserData } from "$lib/discord/types";
    import SolarMusicLibraryLinear from "~icons/solar/music-library-linear";
    import Tooltip from "./ui/Tooltip.svelte";

    let { user, playlists }: { user: UserData; playlists: InsertPlaylist[] } = $props();
</script>

<div class="flex size-full w-20 flex-col items-center justify-start rounded-lg bg-slate-900">
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
                    <!-- This div is used to wrap the button for tooltip alignment -->
                    <div>
                        <button
                            aria-label={playlist.name}
                            class="size-15 cursor-pointer rounded-lg bg-slate-800 bg-cover"
                            style="background-image: url({playlist.cover});"
                            onclick={() => goto(`/playlist/${user?.id}/${playlist.id}`)}
                            oncontextmenu={(e) => {
                                e.preventDefault();
                                const actions = createPlaylistActions({ name: playlist.name, id: playlist.id ?? "" }, user?.id);
                                openCtxMenu(e, actions);
                            }}
                        >
                        </button>
                    </div>
                {/snippet}
                {#snippet content()}
                    {playlist.name}
                {/snippet}
            </Tooltip>
        {/each}
    </div>
</div>
