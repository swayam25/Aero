<script lang="ts">
    import { invalidateAll } from "$app/navigation";
    import Draggable from "$lib/components/ui/Draggable.svelte";
    import MarqueeText from "$lib/components/ui/MarqueeText.svelte";
    import Seo from "$lib/components/ui/Seo.svelte";
    import Switch from "$lib/components/ui/Switch.svelte";
    import Tooltip from "$lib/components/ui/Tooltip.svelte";
    import { createPlaylistSongActions, openCtxMenu } from "$lib/ctxmenu";
    import { enhanceSong, fetchSongDetailed, playPlaylist, store } from "$lib/player";
    import { supabase } from "$lib/supabase";
    import { formatTime } from "$lib/utils/time";
    import { onDestroy } from "svelte";
    import { toast } from "svelte-sonner";
    import { expoOut } from "svelte/easing";
    import { fade, fly } from "svelte/transition";
    import type { SongFull } from "ytmusic-api";
    import HugeiconsCd from "~icons/hugeicons/cd";
    import SolarConfoundedCircleLinear from "~icons/solar/confounded-circle-linear";
    import type { PageData } from "./$types";

    let { data }: { data: PageData } = $props();
    let isPublic: boolean = $derived(data.playlist.isPublic);
    let enableToggleBtn: boolean = $state(true);
    let playlistSongs: Promise<SongFull>[] = $derived(data.playlistSongs);
    let playlistObject: { id: number; song: Promise<SongFull> }[] = $state([]);

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
            toast.promise(
                async () => {
                    const resp = await fetch(`/api/playlist/${data.playlist.id}`, {
                        method: "POST",
                        body: JSON.stringify({
                            key: "reorder",
                            value: {
                                playlistID: data.playlist.id,
                                songIDs: (await Promise.all(playlistObject.map((item) => item.song))).map((item) => item.videoId),
                            },
                        }),
                        headers: { "Content-Type": "application/json" },
                    });
                    if (!resp.ok) {
                        const respData = await resp.json();
                        throw new Error(respData.error);
                    }
                },
                {
                    loading: "Syncing playlist...",
                    success: "Playlist synced successfully",
                    error: (e) => {
                        return `${e}`;
                    },
                },
            );
        }, 1000);
    }

    $effect(() => {
        playlistObject = playlistSongs.map((item, index) => ({
            id: index,
            song: item,
        }));
    });

    // Sync playlist data with db
    const channel = supabase
        .channel("playlist-changes-playlists")
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
    onDestroy(() => {
        channel.unsubscribe();
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

    let userDecorElement: HTMLImageElement | null = $state(null);
</script>

{#if data.playlist.isPublic}
    <Seo
        title={`${data.playlist.name} Playlist`}
        description={`Created By ${data.user.global_name}`}
        image={data.playlist.cover || `https://cdn.discordapp.com/avatars/${data.user?.id}/${data.user?.avatar}?size=4096`}
    />
{:else}
    <Seo />
{/if}

<div class="flex w-full flex-col items-center justify-center gap-4 md:flex-row md:justify-start">
    <div class="size-40 shrink-0 rounded-lg bg-slate-800 bg-cover md:size-50" style="background-image: url({data.playlist.cover});"></div>
    <div class="flex flex-col items-center justify-center gap-2 md:items-start">
        <div class="flex items-center justify-center gap-2"></div>
        <div class="flex items-center justify-center gap-2 md:items-end">
            <h1
                class="text-4xl font-bold"
                class:md:text-6xl={data.playlist.name.length > 10 && data.playlist.name.length <= 20}
                class:md:text-8xl={data.playlist.name.length <= 10}
            >
                {data.playlist.name}
            </h1>
            {#if data.loginUser?.id === data.user?.id}
                <Tooltip side="right" disabled={!enableToggleBtn}>
                    {#snippet trigger()}
                        <Switch size="md" checked={isPublic} disabled={!enableToggleBtn} onCheckedChange={togglePlaylistView} />
                    {/snippet}
                    {#snippet content()}
                        {isPublic ? "Public" : "Private"} Playlist
                    {/snippet}
                </Tooltip>
            {/if}
        </div>
        <div class="flex w-full flex-col items-center justify-center gap-1 text-sm text-slate-400 md:items-start">
            <p>Created At {new Date(data.playlist.createdAt).toLocaleDateString()}, {data.playlist.songs.length} songs</p>
            <div class="flex items-center justify-start gap-2">
                <p>By</p>
                <a
                    href="/profile/{data.user?.id}"
                    class="flex items-center justify-start gap-1 hover:underline"
                    onmouseenter={() => {
                        if (userDecorElement) {
                            userDecorElement.src = userDecorElement.src.includes(".webp")
                                ? userDecorElement.src.replace(".webp", "")
                                : `${userDecorElement.src}.webp`;
                        }
                    }}
                    onmouseleave={() => {
                        if (userDecorElement) {
                            userDecorElement.src = userDecorElement.src.includes(".webp")
                                ? userDecorElement.src.replace(".webp", "")
                                : `${userDecorElement.src}.webp`;
                        }
                    }}
                >
                    <div class="relative flex size-8 items-center justify-center">
                        <img
                            src={`https://cdn.discordapp.com/avatars/${data.user?.id}/${data.user?.avatar}?size=4096`}
                            alt="{data.user?.global_name}'s Avatar"
                            class="rounded-full bg-slate-800"
                        />
                        {#if data.user?.avatar_decoration_data?.asset}
                            <img
                                src={`https://cdn.discordapp.com/avatar-decoration-presets/${data.user?.avatar_decoration_data?.asset}.webp`}
                                alt="Avatar Decoration"
                                class="absolute"
                                bind:this={userDecorElement}
                            />
                        {/if}
                    </div>
                    <p>{data.user?.global_name}</p>
                </a>
            </div>
        </div>
    </div>
</div>

<ul class="mt-2 flex list-none flex-col items-start justify-center gap-2 py-2 md:mt-5 md:py-5" class:!mt-20={playlistSongs.length <= 0}>
    {#if playlistSongs.length <= 0}
        <div in:fade={{ duration: 100 }} class="flex size-full items-center justify-center">
            <div in:fade={{ duration: 100 }} class="flex flex-col items-center justify-center gap-2">
                <SolarConfoundedCircleLinear class="size-10 text-slate-400 md:size-15" />
                <p class="text-lg text-slate-400 md:text-xl">Playlist is empty</p>
            </div>
        </div>
    {:else}
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
                        <div class="h-5 w-[80%] animate-pulse rounded-lg bg-slate-900 font-bold"></div>
                        <div class="h-5 w-[50%] animate-pulse truncate rounded-lg bg-slate-900"></div>
                    </div>
                </div>
            {:then song}
                {@const enhanced = enhanceSong(song)}
                <Draggable items={playlistObject} onReorder={handleReorder} onDragEnd={handleDragEnd} class="w-full">
                    {#snippet children()}
                        <li class="w-full">
                            <button
                                onclick={async () => {
                                    await playPlaylist(
                                        fetchSongDetailed(song),
                                        playlistObject.map((item) => item.song),
                                    );
                                }}
                                in:fly={{ duration: 500, easing: expoOut, x: -100, y: 0 }}
                                out:fly={{ duration: 500, easing: expoOut, x: 100, y: 0 }}
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
                                class="pl-song-handle flex w-full cursor-pointer items-center justify-center gap-2 rounded-lg p-2 transition-colors duration-200 hover:bg-slate-800"
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
                                <img src={enhanced.thumbnail.SMALL} alt="{song.name}'s Thumbnail" class="size-15 rounded-lg" />
                                <div class="flex w-full flex-col items-center justify-center text-left">
                                    <MarqueeText class="w-10 font-bold" text={song.name} />
                                    <MarqueeText class="w-10 text-sm text-slate-400" text={song.artist.name} />
                                </div>
                                <p class="text-sm text-slate-400">{formatTime(song.duration ?? 0)}</p>
                            </button>
                        </li>
                    {/snippet}
                </Draggable>
            {/await}
        {/each}
    {/if}
</ul>
