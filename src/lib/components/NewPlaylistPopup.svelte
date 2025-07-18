<script lang="ts">
    import { invalidateAll } from "$app/navigation";
    import DialogPopup from "$lib/components/ui/DialogPopup.svelte";
    import Input from "$lib/components/ui/Input.svelte";
    import { Dialog } from "bits-ui";
    import { onMount, type Snippet } from "svelte";
    import { toast } from "svelte-sonner";
    import MaterialSymbolsAdd2Rounded from "~icons/material-symbols/add-2-rounded";
    import SolarPlaylist2Linear from "~icons/solar/playlist-2-linear";

    interface Props {
        children: Snippet;
    }
    let { children }: Props = $props();

    let input: HTMLInputElement | null = $state(null);
    let inputValue: string = $state("");
    let open: boolean = $state(false);

    async function createPlaylist() {
        open = false;
        const plName = inputValue.trim();
        inputValue = "";
        const resp = await fetch("/api/playlist", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ key: "create_pl", value: plName }),
        });
        const respData = await resp.json();

        if (resp.ok) toast.success("Playlist created successfully");
        else toast.error(respData.error);
        invalidateAll();
    }

    onMount(() => {
        input?.focus();
    });
</script>

<DialogPopup title="NEW PLAYLIST" bind:open>
    {#snippet trigger()}
        {@render children()}
    {/snippet}
    {#snippet description()}
        Enter a new name for the playlist and click <span class="font-semibold text-sky-500">create</span> to create a new playlist.
    {/snippet}
    {#snippet fields()}
        <Input
            bind:value={inputValue}
            class="w-full"
            placeholder="Playlist Name"
            icon={SolarPlaylist2Linear}
            max={10}
            onEnter={createPlaylist}
            bind:ref={input}
        />
    {/snippet}
    {#snippet actions()}
        <Dialog.Close
            class="not-disabled:hover:!bg-green-500/10 not-disabled:hover:text-green-500 disabled:cursor-not-allowed"
            onclick={createPlaylist}
            disabled={!inputValue}
        >
            <MaterialSymbolsAdd2Rounded class="size-5" />
            Create
        </Dialog.Close>
    {/snippet}
</DialogPopup>
