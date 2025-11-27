<script lang="ts">
    import { goto } from "$app/navigation";
    import { createPlaylistActions, openCtxMenu } from "$lib/ctxmenu";
    import type { InsertPlaylist } from "$lib/db/schema";
    import type { UserData } from "$lib/discord/types";
    import type { Component } from "svelte";
    import SolarMusicLibraryLinear from "~icons/solar/music-library-linear";
    import SolarUsersGroupRoundedLinear from "~icons/solar/users-group-rounded-linear";
    import Tooltip from "./ui/Tooltip.svelte";

    let { user, playlists }: { user: UserData | null; playlists: InsertPlaylist[] } = $props();

    interface Item {
        name: string;
        icon: Component;
        href: string;
    }
    let items: Item[] = [
        {
            name: "Playlists",
            icon: SolarMusicLibraryLinear,
            href: "/playlist",
        },
        {
            name: "Rooms",
            icon: SolarUsersGroupRoundedLinear,
            href: "/room",
        },
    ];

    const playlistHeight = `calc(100vh - ${140 + 40 + items.length * 52}px)`;
</script>

<div class="flex h-full w-20 flex-col items-center justify-start rounded-lg bg-slate-900">
    <div class="flex flex-col items-center justify-start gap-5 py-5">
        {#each items as item}
            <Tooltip side="right" content={item.name}>
                <a href={item.href} class="cursor-pointer opacity-80 transition-opacity hover:opacity-100">
                    <item.icon class="size-8" />
                </a>
            </Tooltip>
        {/each}
    </div>

    <div class="flex flex-col items-center justify-start gap-5 overflow-y-auto" style="height: {playlistHeight}; scrollbar-width: none;">
        {#each playlists as playlist}
            <Tooltip side="right" content={playlist.name || "Unnamed playlist"}>
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
                        if (!user) return;
                        const actions = createPlaylistActions({ name: playlist.name || "Unnamed playlist", id: playlist.id ?? "" }, user?.id);
                        openCtxMenu(e, actions);
                    }}
                ></div>
            </Tooltip>
        {/each}
    </div>
</div>
