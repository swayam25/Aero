<script lang="ts">
    import { invalidateAll } from "$app/navigation";
    import DialogPopup from "$lib/components/ui/DialogPopup.svelte";
    import Input from "$lib/components/ui/Input.svelte";
    import Select from "$lib/components/ui/Select.svelte";
    import { refreshPlaylistsCache } from "$lib/ctxmenu/playlist";
    import { isImportingPlaylist } from "$lib/stores";
    import { Dialog } from "bits-ui";
    import { type Component, type Snippet } from "svelte";
    import { toast } from "svelte-sonner";
    import SimpleIconsSpotify from "~icons/simple-icons/spotify";
    import SimpleIconsYoutubemusic from "~icons/simple-icons/youtubemusic";
    import SolarImportLinear from "~icons/solar/import-linear";
    import SolarPlaylist2Linear from "~icons/solar/playlist-2-linear";

    interface Props {
        children: Snippet;
    }
    let { children }: Props = $props();

    let input: HTMLInputElement | null = $state(null);
    let inputValue: string = $state("");
    let selectedSource: string = $state("");
    let open: boolean = $state(false);

    async function importPlaylist() {
        if ($isImportingPlaylist) return;

        const playlistUrl = inputValue.trim();
        inputValue = "";

        if (!playlistUrl || !selectedSource) {
            toast.error("Please select a source and enter a playlist URL");
            return;
        }

        // Extract playlist ID based on selected source
        let playlistID = "";
        if (selectedSource === "spotify") {
            const spotifyMatch = playlistUrl.match(/playlist\/([a-zA-Z0-9]+)/);
            if (!spotifyMatch) {
                toast.error("Invalid Spotify playlist URL");
                return;
            }
            playlistID = spotifyMatch[1];
        } else if (selectedSource === "ytmusic") {
            const ytmusicMatch = playlistUrl.match(/[?&]list=([a-zA-Z0-9_-]+)/);
            if (!ytmusicMatch) {
                toast.error("Invalid YouTube Music playlist URL");
                return;
            }
            playlistID = ytmusicMatch[1];
        }

        open = false;
        isImportingPlaylist.set(true);
        toast.promise(
            (async () => {
                try {
                    const resp = await fetch("/api/import", {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json",
                        },
                        body: JSON.stringify({ source: selectedSource, playlistID }),
                    });
                    const respData = await resp.json();

                    if (resp.ok) {
                        await refreshPlaylistsCache();
                        invalidateAll();
                        return respData.message;
                    } else {
                        throw new Error(respData.error);
                    }
                } finally {
                    isImportingPlaylist.set(false);
                }
            })(),
            {
                loading: "Importing playlist...",
                success: (data) => {
                    return String(data);
                },
                error: (err) => {
                    return String(err) || "Failed to import playlist";
                },
            },
        );
    }

    interface SelectItem {
        value: string;
        label: string;
        icon?: Component;
    }
    let selectItems: SelectItem[] = $state([
        { value: "spotify", label: "Spotify", icon: SimpleIconsSpotify },
        { value: "ytmusic", label: "YouTube Music", icon: SimpleIconsYoutubemusic },
    ]);

    // Dynamic icon based on selected source
    let inputIcon: Component = $derived.by(() => {
        if (selectedSource === "spotify") return SimpleIconsSpotify;
        if (selectedSource === "ytmusic") return SimpleIconsYoutubemusic;
        return SolarPlaylist2Linear;
    });
</script>

<DialogPopup
    title="IMPORT PLAYLIST"
    bind:open
    onOpenAutoFocus={(e) => {
        e.preventDefault();
        input?.focus();
    }}
    disabled={$isImportingPlaylist}
>
    {#snippet trigger()}
        {@render children()}
    {/snippet}
    {#snippet description()}
        Select the source and enter the playlist URL, then click <span class="font-semibold text-sky-500">import</span> to import songs.
    {/snippet}
    {#snippet fields()}
        <div class="flex w-full flex-col gap-2">
            <Select bind:value={selectedSource} items={selectItems} placeholder="Select Source" class="w-full" />
            <Input
                bind:value={inputValue}
                class="w-full"
                placeholder="Playlist URL"
                icon={inputIcon}
                onEnter={importPlaylist}
                disabled={!selectedSource}
                bind:ref={input}
            />
        </div>
    {/snippet}
    {#snippet actions()}
        <Dialog.Close
            class="not-disabled:hover:!bg-green-500/10 not-disabled:hover:text-green-500 disabled:cursor-not-allowed"
            onclick={importPlaylist}
            disabled={!inputValue}
        >
            <SolarImportLinear class="size-5" />
            Import
        </Dialog.Close>
    {/snippet}
</DialogPopup>
