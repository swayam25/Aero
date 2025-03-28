<script lang="ts">
    import { invalidateAll } from "$app/navigation";
    import { openCtxMenu, store } from "$lib/ctxmenu";
    import type { InsertPlaylist } from "$lib/db/schema";
    import { addToQueue, play, store as playerStore, removeFromQueue, togglePause } from "$lib/player";
    import { showPlDeletePopup, showPlRenamePopup } from "$lib/popups";
    import { toast } from "svelte-sonner";
    import { fade } from "svelte/transition";
    import SolarAltArrowLeftLinear from "~icons/solar/alt-arrow-left-linear";
    import SolarConfoundedCircleLinear from "~icons/solar/confounded-circle-linear";
    import SolarMusicLibraryLinear from "~icons/solar/music-library-linear";
    import SolarNotificationLinesRemoveLinear from "~icons/solar/notification-lines-remove-linear";
    import SolarPauseLinear from "~icons/solar/pause-linear";
    import SolarPlayLinear from "~icons/solar/play-linear";
    import SolarPlaylist2Linear from "~icons/solar/playlist-2-linear";
    import SolarRestartLinear from "~icons/solar/restart-linear";
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

    let ctxMenu: HTMLDivElement = $state(null!);
    let x: number = $state(0);
    let y: number = $state(0);
    let dropdownOffset: boolean = $state(false);

    $effect(() => {
        if ($store.isOpen && ctxMenu) {
            const { offsetHeight: menuHeight, offsetWidth: menuWidth } = ctxMenu;

            // Adjust vertical position
            if ($store.y + menuHeight > window.innerHeight - 72) {
                y = Math.max($store.y - menuHeight, 50);
            } else {
                y = $store.y;
            }

            // Adjust horizontal position
            if ($store.x + menuWidth > window.innerWidth) {
                x = Math.max($store.x - menuWidth, 50);
            } else {
                x = $store.x;
            }
        }
    });

    async function fetchPlaylists() {
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

                        if (dropdownOffset) {
                            dropdownOffset = false;
                            $store.y += 228;
                        }

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
                    <div in:fade={{ duration: 100 }} class="flex max-h-[260px] w-full flex-col items-start justify-start overflow-y-auto">
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
                                                    value: {
                                                        playlistID: playlist.id,
                                                        songID: $store.song.videoId,
                                                        songCover: $store.song.thumbnails[0].url.replace("=w60-h60-l90-rj", "")
                                                    }
                                                }),
                                                method: "POST"
                                            });
                                            const respData = await resp.json();
                                            if (resp.ok) toast.success("Added song to playlist");
                                            else toast.error(respData.error);
                                        }
                                    }}
                                >
                                    <div
                                        class="size-10 shrink-0 rounded-lg bg-slate-800 bg-cover transition-colors duration-200 group-hover:bg-slate-900"
                                        style="background-image: url({playlist.cover});"
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
                    {:else if $store.type === "queue" && $store.song}
                        {#if $store.song.videoId === $playerStore.meta?.videoId}
                            <!-- Pause/Resume -->
                            <CtxButton
                                onclick={async () => {
                                    if ($store.song) await togglePause();
                                }}
                            >
                                {#if $playerStore.state === "paused"}
                                    <SolarPlayLinear class="size-5" />
                                    Resume
                                {:else}
                                    <SolarPauseLinear class="size-5" />
                                    Pause
                                {/if}
                            </CtxButton>
                        {:else}
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
                    {/if}
                    {#if $store.loginUserID}
                        <CtxButton
                            onclick={(e) => {
                                e.stopPropagation();

                                $store.showPlaylistMenu = true;

                                if (y > window.innerHeight - 300) {
                                    dropdownOffset = true;
                                    $store.y -= 228;
                                }
                            }}
                        >
                            <SolarMusicLibraryLinear class="size-5" />
                            Add To Playlist
                        </CtxButton>
                    {/if}
                {:else if $store.type === "playlist" && $store.playlistData}
                    <!-- Delete PLaylist -->
                    <CtxButton
                        type="error"
                        onclick={() => {
                            showPlDeletePopup($store?.playlistData);
                        }}
                    >
                        <SolarTrashBinTrashLinear class="size-5" />
                        Delete Playlist
                    </CtxButton>
                    <!-- Rename Playlist -->
                    <CtxButton onclick={() => showPlRenamePopup($store?.playlistData)}>
                        <SolarRestartLinear class="size-5" />
                        Rename Playlist
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
                            Add To Queue
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
                                        value: {
                                            playlistID: $store.playlistData?.id,
                                            songID: $store.song?.videoId
                                        }
                                    }),
                                    method: "POST"
                                });
                                const respData = await resp.json();
                                if (resp.ok) toast.success("Removed song from playlist");
                                else toast.error(respData.error);
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
