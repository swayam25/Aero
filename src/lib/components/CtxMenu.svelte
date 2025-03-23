<script lang="ts">
    import { invalidateAll } from "$app/navigation";
    import { store } from "$lib/ctxmenu";
    import type { InsertPlaylist } from "$lib/db/schema";
    import { addToQueue, play, store as playerStore, removeFromQueue } from "$lib/player";
    import { fade } from "svelte/transition";
    import SolarAltArrowLeftLinear from "~icons/solar/alt-arrow-left-linear";
    import SolarConfoundedCircleLinear from "~icons/solar/confounded-circle-linear";
    import SolarMusicLibraryLinear from "~icons/solar/music-library-linear";
    import SolarNotificationLinesRemoveLinear from "~icons/solar/notification-lines-remove-linear";
    import SolarPlayLinear from "~icons/solar/play-linear";
    import SolarPlaylist2Linear from "~icons/solar/playlist-2-linear";
    import SolarTrashBinTrashLinear from "~icons/solar/trash-bin-trash-linear";
    import CtxButton from "./CtxButton.svelte";

    $effect(() => {
        const bodyElement = document.getElementById("body");
        const queueElement = document.getElementById("queue");
        if (bodyElement && queueElement) {
            bodyElement.style.overflow = $store.isOpen ? "hidden" : "";
            queueElement.style.overflow = $store.isOpen ? "hidden" : "";
        }
    });

    let ctxMenu: HTMLDivElement | null = $state(null);
    let x: number = $state(0);
    let y: number = $state(0);

    $effect(() => {
        if ($store.isOpen && ctxMenu) {
            const { offsetHeight: menuHeight, offsetWidth: menuWidth } = ctxMenu;
            const playerRect = document.getElementById("player")?.getBoundingClientRect();

            // Adjust vertical position
            if ($store.y + menuHeight > window.innerHeight) {
                y = Math.max($store.y - menuHeight, 50);
            } else if (playerRect && $store.y + menuHeight > playerRect.top) {
                y = Math.max($store.y - menuHeight, 50);
            } else {
                y = $store.y;
            }

            // Adjust horizontal position
            if ($store.x + menuWidth > window.innerWidth) {
                x = Math.max($store.x - menuWidth, 50);
            } else if (playerRect && $store.x + menuWidth > playerRect.left) {
                x = Math.max($store.x - menuWidth, 50);
            } else {
                x = $store.x;
            }
        }
    });

    export async function deletePlaylist() {
        const resp = await fetch(`/api/playlist`, {
            body: JSON.stringify({ id: $store.playlistData?.id }),
            method: "DELETE"
        });
        invalidateAll();
    }

    export async function fetchPlaylists() {
        const resp = await fetch(`/api/playlists`);
        return (await resp.json()) as InsertPlaylist[];
    }
</script>

{#if $store.isOpen}
    <div
        transition:fade={{ duration: 100 }}
        bind:this={ctxMenu}
        class="absolute z-1000 flex min-w-45 flex-col items-start justify-center rounded-lg border border-slate-700 bg-slate-900 p-2 text-sm transition-all duration-200"
        style="top: {y}px; left: {x}px;"
    >
        {#if $store.showPlaylistMenu}
            <div in:fade={{ duration: 100 }} class="flex w-full flex-col items-start justify-center">
                <CtxButton
                    onclick={(e) => {
                        e.stopPropagation();
                        $store.showPlaylistMenu = false;
                    }}
                >
                    <SolarAltArrowLeftLinear class="size-5" />
                    Back
                </CtxButton>
                {#await fetchPlaylists()}
                    <div in:fade={{ duration: 100 }} class="flex w-full flex-col items-start justify-center">
                        {#each Array(2) as _}
                            <CtxButton disabled>
                                <div class="size-10 shrink-0 animate-pulse rounded-lg bg-slate-800"></div>
                                <div class="h-5 w-full animate-pulse rounded-lg bg-slate-800"></div>
                            </CtxButton>
                        {/each}
                    </div>
                {:then playlists}
                    <div in:fade={{ duration: 100 }} class="flex w-full flex-col items-start justify-center">
                        {#if playlists.length === 0}
                            <div class="flex w-full items-center justify-center gap-2 p-2 text-slate-400">
                                <SolarConfoundedCircleLinear class="size-5" />
                                No playlists found
                            </div>
                        {:else}
                            {#each playlists as playlist}
                                <CtxButton
                                    onclick={async () => {
                                        if ($store.song) {
                                            const resp = await fetch(`/api/playlist/${playlist.id}`, {
                                                body: JSON.stringify({
                                                    key: "add_song",
                                                    value: { playlistID: playlist.id, songID: $store.song.videoId }
                                                }),
                                                method: "POST"
                                            });
                                        }
                                    }}
                                >
                                    <div
                                        class="size-10 shrink-0 rounded-lg bg-slate-800 transition-colors duration-200 group-hover:bg-slate-900"
                                    ></div>
                                    {playlist.name}
                                </CtxButton>
                            {/each}
                        {/if}
                    </div>
                {/await}
            </div>
        {:else}
            <div in:fade={{ duration: 100 }} class="flex w-full flex-col items-start justify-center">
                {#if $store.type === "song" || ($store.type === "queue" && $store.song)}
                    {#if $store.type === "song" && $store.song}
                        <!-- Play -->
                        <CtxButton
                            onclick={async () => {
                                if ($store.song) await play($store.song);
                            }}
                        >
                            <SolarPlayLinear class="size-5" />
                            Play
                        </CtxButton>
                        {#if $playerStore.queue.length > 0}
                            <!-- Add To Queue -->
                            <CtxButton
                                onclick={async () => {
                                    if ($store.song) await addToQueue($store.song);
                                }}
                            >
                                <SolarPlaylist2Linear class="size-5" />
                                Add to Queue
                            </CtxButton>
                        {/if}
                    {:else if $store.type === "queue" && $store.song && $store.song.videoId !== $playerStore.meta?.videoId}
                        <!-- Play -->
                        <CtxButton
                            onclick={async () => {
                                if ($store.song) await play($store.song, true);
                            }}
                        >
                            <SolarPlayLinear class="size-5" />
                            Play
                        </CtxButton>
                        <!-- Remove From Queue -->
                        <CtxButton
                            onclick={async () => {
                                if ($store.song) await removeFromQueue($store.song);
                            }}
                        >
                            <SolarNotificationLinesRemoveLinear class="size-5" />
                            Remove from Queue
                        </CtxButton>
                    {/if}
                    <CtxButton
                        onclick={(e) => {
                            e.stopPropagation();
                            $store.showPlaylistMenu = true;
                        }}
                    >
                        <SolarMusicLibraryLinear class="size-5" />
                        Add To Playlist
                    </CtxButton>
                {:else if $store.type === "playlist" && $store.playlistData}
                    <!-- Delete Playlist -->
                    <CtxButton type="error" onclick={deletePlaylist}>
                        <SolarTrashBinTrashLinear class="size-5" />
                        Delete Playlist
                    </CtxButton>
                {:else if $store.type === "playlistSong" && $store.song && $store.playlistData}
                    <!-- Play -->
                    <CtxButton
                        onclick={async () => {
                            if ($store.song) await play($store.song);
                        }}
                    >
                        <SolarPlayLinear class="size-5" />
                        Play
                    </CtxButton>
                    {#if $playerStore.queue.length > 0}
                        <!-- Add To Queue -->
                        <CtxButton
                            onclick={async () => {
                                if ($store.song) await addToQueue($store.song);
                            }}
                        >
                            <SolarPlaylist2Linear class="size-5" />
                            Add to Queue
                        </CtxButton>
                    {/if}
                    {#if $store.loginUserID && $store.accessedUserID && $store.loginUserID === $store.accessedUserID}
                        <!-- Remove From Playlist -->
                        <CtxButton
                            type="error"
                            onclick={async () => {
                                const resp = await fetch(`/api/playlist/${$store.playlistData?.id}`, {
                                    body: JSON.stringify({
                                        key: "remove_song",
                                        value: { playlistID: $store.playlistData?.id, songID: $store.song?.videoId }
                                    }),
                                    method: "POST"
                                });
                                invalidateAll();
                            }}
                        >
                            <SolarTrashBinTrashLinear class="size-5" />
                            Remove from Playlist
                        </CtxButton>
                    {/if}
                {/if}
            </div>
        {/if}
    </div>
{/if}
