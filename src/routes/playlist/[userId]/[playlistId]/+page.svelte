<script lang="ts">
    import { invalidateAll } from "$app/navigation";
    import Avatar from "$lib/components/ui/Avatar.svelte";
    import Button from "$lib/components/ui/Button.svelte";
    import Draggable from "$lib/components/ui/Draggable.svelte";
    import Seo from "$lib/components/ui/Seo.svelte";
    import Switch from "$lib/components/ui/Switch.svelte";
    import Tooltip from "$lib/components/ui/Tooltip.svelte";
    import { createPlaylistSongActions, openCtxMenu } from "$lib/ctxmenu";
    import { enhanceSong, fetchSongDetailed, playPlaylist, store } from "$lib/player";
    import { isImportingPlaylist, store as popupStore, showPlDeletePopup, showPlRenamePopup } from "$lib/stores";
    import { supabaseChannel } from "$lib/supabase/channel";
    import { formatTime } from "$lib/utils/time";
    import { toast } from "svelte-sonner";
    import { expoOut } from "svelte/easing";
    import { fade, fly } from "svelte/transition";
    import type { SongFull } from "ytmusic-api";
    import HugeiconsCd from "~icons/hugeicons/cd";
    import IconParkOutlineLoadingFour from "~icons/icon-park-outline/loading-four";
    import LineMdCancel from "~icons/line-md/cancel";
    import LineMdConfirm from "~icons/line-md/confirm";
    import SolarConfoundedCircleLinear from "~icons/solar/confounded-circle-linear";
    import SolarRestartLinear from "~icons/solar/restart-linear";
    import SolarShareLinear from "~icons/solar/share-linear";
    import SolarTrashBinTrashLinear from "~icons/solar/trash-bin-trash-linear";
    import type { PageData } from "./$types";

    let { data }: { data: PageData } = $props();
    let isPublic: boolean = $derived(data.playlist.isPublic);
    let enableToggleBtn: boolean = $state(true);
    let playlistSongs: Promise<SongFull>[] = $derived(data.playlistSongs);
    let playlistObject: { id: number; song: Promise<SongFull> }[] = $state([]);
    let originalOrder: string[] = $state([]);
    let isSyncing: boolean = $state(false);

    let plSyncTimeout: NodeJS.Timeout | null = $state(null);

    // Handle reordering items in the playlist
    function handleReorder(fromIndex: number, toIndex: number) {
        const [movedItem] = playlistObject.splice(fromIndex, 1);
        playlistObject.splice(toIndex, 0, movedItem);
    }

    // Handle drag end - sync with server
    async function handleDragEnd() {
        if (plSyncTimeout) {
            clearTimeout(plSyncTimeout);
        }
        plSyncTimeout = setTimeout(async () => {
            const currentOrder = (await Promise.all(playlistObject.map((item) => item.song))).map((item) => item.videoId);
            const orderChanged = currentOrder.length !== originalOrder.length || currentOrder.some((id, index) => id !== originalOrder[index]);
            if (!orderChanged) {
                return;
            }

            isSyncing = true;
            toast.promise(
                async () => {
                    const resp = await fetch(`/api/playlist/${data.playlist.id}`, {
                        method: "POST",
                        body: JSON.stringify({
                            key: "reorder",
                            value: {
                                playlistID: data.playlist.id,
                                songIDs: currentOrder,
                            },
                        }),
                        headers: { "Content-Type": "application/json" },
                    });
                    if (!resp.ok) {
                        const respData = await resp.json();
                        throw new Error(respData.error);
                    }
                    // Update original order after successful sync
                    originalOrder = currentOrder;
                },
                {
                    loading: "Syncing playlist...",
                    success: "Playlist synced successfully",
                    error: (e) => {
                        return `${e}`;
                    },
                },
            );
            isSyncing = false;
        }, 1000);
    }

    $effect(() => {
        playlistObject = playlistSongs.map((item, index) => ({
            id: index,
            song: item,
        }));

        Promise.all(playlistSongs).then((songs) => {
            originalOrder = songs.map((song) => song.videoId);
        });
    });

    // Sync playlist data with db
    $effect(() => {
        const channel = supabaseChannel("playlist-changes-playlists")
            .on(
                "postgres_changes",
                {
                    event: "UPDATE",
                    schema: "public",
                    table: "playlist",
                    filter: `user_id=eq.${data.user?.id}`,
                },
                () => invalidateAll(),
            )
            .subscribe();
        return () => {
            channel.unsubscribe();
        };
    });

    async function togglePlaylistView() {
        enableToggleBtn = false;
        const resp = await fetch(`/api/playlist/${data.playlist.id}`, {
            method: "POST",
            body: JSON.stringify({ key: "toggle_view", value: { playlistID: data.playlist.id } }),
            headers: { "Content-Type": "application/json" },
        });
        const respData = await resp.json();
        if (resp.ok) {
            isPublic = respData.isPublic;
            toast.success(`Playlist is now ${isPublic ? "public" : "private"}`);
        } else {
            toast.error(respData.error);
        }
        setTimeout(() => {
            enableToggleBtn = true;
        }, 500);
    }

    let animateAvatar: boolean = $state(false);
    let shareLoading: boolean = $state(false);
    let shareSuccess: boolean = $state(false);
    let shareError: boolean = $state(false);

    async function sharePlaylist() {
        shareLoading = true;
        shareSuccess = false;
        try {
            const resp = await fetch(`/api/playlist/${data.playlist.id}`, {
                method: "POST",
                body: JSON.stringify({
                    key: "fetch",
                    value: { playlistID: data.playlist.id },
                }),
                headers: { "Content-Type": "application/json" },
            });

            const plData = await resp.json();
            if (!resp.ok) {
                toast.error(plData.error);
            } else if (plData.isPublic) {
                const playlistURL = `${window.location.origin}/playlist/${data.loginUser?.id}/${data.playlist.id}`;
                navigator.clipboard.writeText(playlistURL);
                shareSuccess = true;
                setTimeout(() => (shareSuccess = false), 2000);
            } else {
                toast.error("Playlist is private");
                shareError = true;
                setTimeout(() => (shareError = false), 2000);
            }
        } catch (error) {
            toast.error("Failed to share playlist");
            shareError = true;
            setTimeout(() => (shareError = false), 2000);
        } finally {
            shareLoading = false;
        }
    }
</script>

{#if data.playlist.isPublic}
    <Seo
        title={`${data.playlist.name} Playlist`}
        description={`Created By ${data.user.global_name}`}
        image={data.playlist.cover || (data.user?.url?.avatar ? `${data.user.url.avatar}?size=4096` : undefined)}
    />
{:else}
    <Seo />
{/if}

<div class="flex w-full flex-col items-center justify-center gap-4 md:flex-row md:items-stretch md:justify-start">
    <div class="size-40 shrink-0 rounded-lg bg-slate-800 bg-cover md:size-50" style="background-image: url({data.playlist.cover});"></div>
    <div class="flex flex-col items-center justify-between gap-2 md:items-start md:self-stretch">
        <div class="flex h-full flex-col items-center justify-center gap-1 md:items-start">
            <div class="flex items-center justify-center gap-2 md:items-end">
                <h1
                    class="text-4xl font-bold"
                    class:md:text-6xl={data.playlist.name.length > 10 && data.playlist.name.length <= 20}
                    class:md:text-8xl={data.playlist.name.length <= 10}
                >
                    {data.playlist.name}
                </h1>
                {#if data.loginUser?.id === data.user?.id}
                    <Tooltip side="right" disabled={!enableToggleBtn} content="{isPublic ? 'Public' : 'Private'} Playlist">
                        <Switch size="md" checked={isPublic} disabled={!enableToggleBtn} onCheckedChange={togglePlaylistView} />
                    </Tooltip>
                {/if}
            </div>
            <div class="flex w-full flex-col items-center justify-center gap-1 text-sm text-slate-400 md:items-start">
                <div class="flex items-center justify-center gap-1 [&>*:not(:first-child)]:before:mr-1 [&>*:not(:first-child)]:before:content-['•']">
                    <p>Created At {new Date(data.playlist.createdAt).toLocaleDateString()}</p>
                    <p>{data.playlist.songs.length} songs</p>
                </div>
                <div class="flex items-center justify-start gap-2">
                    <p>By</p>
                    <a
                        href="/profile/{data.user?.id}"
                        class="flex items-center justify-start gap-1 hover:underline"
                        onmouseenter={() => {
                            animateAvatar = true;
                        }}
                        onmouseleave={() => {
                            animateAvatar = false;
                        }}
                    >
                        <Avatar user={data.user} animateOnHover={false} {animateAvatar} size="sm" />
                        <p>{data.user?.global_name}</p>
                    </a>
                </div>
            </div>
        </div>
        <div class="flex items-center justify-center gap-2">
            {#if data.loginUser?.id === data.user?.id}
                <Tooltip content="Delete Playlist" side="bottom">
                    <Button
                        size="icon"
                        class={!$popupStore.isPlDeleting && !$popupStore.isPlRenaming
                            ? "brightness-100! hover:bg-red-500/10! hover:text-red-500"
                            : ""}
                        disabled={$popupStore.isPlDeleting || $popupStore.isPlRenaming}
                        onclick={() => {
                            showPlDeletePopup({ name: data.playlist.name, id: data.playlist.id });
                        }}
                    >
                        {#if $popupStore.isPlDeleting}
                            <IconParkOutlineLoadingFour class="size-5 animate-spin" />
                        {:else}
                            <SolarTrashBinTrashLinear class="size-5" />
                        {/if}
                    </Button>
                </Tooltip>
                <Tooltip content="Rename Playlist" side="bottom">
                    <Button
                        size="icon"
                        disabled={$popupStore.isPlDeleting || $popupStore.isPlRenaming}
                        onclick={() => {
                            showPlRenamePopup({ name: data.playlist.name, id: data.playlist.id });
                        }}
                    >
                        {#if $popupStore.isPlRenaming}
                            <IconParkOutlineLoadingFour class="size-5 animate-spin" />
                        {:else}
                            <SolarRestartLinear class="size-5" />
                        {/if}
                    </Button>
                </Tooltip>
            {/if}
            <Tooltip content="Share" side="bottom">
                <Button
                    size="icon"
                    onclick={sharePlaylist}
                    disabled={shareLoading}
                    class="
                    {shareLoading ? 'cursor-progress!' : ''}
                    {shareSuccess ? 'bg-green-500/10! brightness-100!' : ''}
                    {shareError ? 'bg-red-500/10! brightness-100!' : ''}
                    "
                >
                    {#if shareLoading}
                        <span in:fade={{ duration: 100 }}>
                            <IconParkOutlineLoadingFour class="size-5 animate-spin" />
                        </span>
                    {:else if shareSuccess}
                        <span in:fade={{ duration: 100 }}>
                            <LineMdConfirm class="size-5 text-green-500" />
                        </span>
                    {:else if shareError}
                        <span in:fade={{ duration: 100 }}>
                            <LineMdCancel class="size-5 text-red-500" />
                        </span>
                    {:else}
                        <span in:fade={{ duration: 100 }}>
                            <SolarShareLinear class="size-5" />
                        </span>
                    {/if}
                </Button>
            </Tooltip>
        </div>
    </div>
</div>

<ul class="mt-2 flex list-none flex-col items-start justify-center gap-2 py-2 md:mt-5 md:py-5" class:!mt-20={playlistSongs.length <= 0}>
    {#if playlistSongs.length <= 0}
        <div in:fade={{ duration: 100 }} class="flex size-full items-center justify-center">
            <div class="flex flex-col items-center justify-center gap-2">
                <SolarConfoundedCircleLinear class="size-10 text-slate-400 md:size-15" />
                <p class="text-lg text-slate-400 md:text-xl">Playlist is empty</p>
            </div>
        </div>
    {:else}
        <Draggable
            onReorder={handleReorder}
            onDragEnd={handleDragEnd}
            disabled={data.loginUser?.id !== data.user.id || $isImportingPlaylist || isSyncing}
            class="flex w-full list-none flex-col items-start justify-center gap-2"
        >
            {#snippet children({
                isDragging,
                dragIndex,
                handleDragStart,
                handleDragOver,
                handleDragEnter,
                handleDragLeave,
                handleDrop,
                handleDragEnd,
                handleTouchStart,
                handleTouchEnd,
                dragOverIndex,
            }: any)}
                {#each playlistObject as { id, song }, idx (id)}
                    {#await song}
                        <div
                            in:fade={{ duration: 100 }}
                            class="flex w-full items-center justify-center gap-2 rounded-lg bg-slate-800 p-2 transition-colors duration-200"
                        >
                            <div class="flex size-10 items-center justify-center p-1 text-lg">
                                <span class="text-slate-200">{idx + 1}</span>
                            </div>
                            <div class="size-15 shrink-0 animate-pulse rounded-lg bg-slate-900"></div>
                            <div class="flex w-full flex-col items-start justify-center gap-2 text-left">
                                <div class="h-5 w-[80%] animate-pulse rounded-lg bg-slate-900"></div>
                                <div class="h-5 w-[50%] animate-pulse truncate rounded-lg bg-slate-900"></div>
                            </div>
                        </div>
                    {:then song}
                        {@const enhanced = enhanceSong(song)}
                        <li
                            class="w-full border-sky-500 transition-all duration-200"
                            draggable={data.loginUser?.id !== data.user.id || $isImportingPlaylist || isSyncing ? "false" : "true"}
                            ondragstart={(e) => handleDragStart(e, idx)}
                            ondragover={(e) => handleDragOver(e, idx)}
                            ondragenter={(e) => handleDragEnter(e, idx)}
                            ondragleave={handleDragLeave}
                            ondrop={(e) => handleDrop(e, idx)}
                            ondragend={handleDragEnd}
                            ontouchstart={(e) => handleTouchStart(e, idx)}
                            ontouchend={handleTouchEnd}
                            class:opacity-80={isDragging && dragIndex === idx}
                            class:border-t={dragOverIndex === idx && dragIndex !== idx}
                        >
                            <button
                                onclick={async () => {
                                    await playPlaylist(
                                        fetchSongDetailed(song),
                                        playlistObject.map((item) => item.song),
                                        data.loginUser?.id || null,
                                    );
                                }}
                                in:fly={{ duration: 400, easing: expoOut, x: -100, y: 0 }}
                                out:fly={{ duration: 400, easing: expoOut, x: 100, y: 0 }}
                                oncontextmenu={(e) => {
                                    e.preventDefault();
                                    const actions = createPlaylistSongActions(
                                        fetchSongDetailed(song),
                                        data.playlist,
                                        data.loginUser?.id || null,
                                        data.user?.id || null,
                                    );
                                    openCtxMenu(e, actions);
                                }}
                                class="group flex w-full min-w-0 cursor-pointer items-center justify-start gap-2 rounded-lg p-2 transition-colors duration-200 hover:bg-slate-800"
                            >
                                <div class="flex size-10 items-center justify-center p-1 text-lg">
                                    {#if song.videoId === $store.meta?.videoId}
                                        <span in:fade={{ duration: 100 }} class="size-full">
                                            <HugeiconsCd class="size-full animate-spin text-sky-500" />
                                        </span>
                                    {:else}
                                        <span in:fade={{ duration: 100 }} class="text-slate-200">{idx + 1}</span>
                                    {/if}
                                </div>
                                <div
                                    class="size-15 shrink-0 rounded-lg bg-slate-800 bg-cover transition-colors duration-200 group-hover:bg-slate-900"
                                    style="background-image: url({enhanced.thumbnail.SMALL});"
                                ></div>
                                <div class="flex-truncate flex flex-col items-start justify-center text-left">
                                    <p class="w-full truncate font-medium" title={song.name}>{song.name}</p>
                                    <p class="w-full truncate text-sm text-slate-400" title={song.artist.name}>{song.artist.name}</p>
                                </div>
                                <p class="shrink-0 text-sm text-slate-400">{formatTime(song.duration ?? 0)}</p>
                            </button>
                        </li>
                    {/await}
                {/each}
            {/snippet}
        </Draggable>
    {/if}
</ul>
