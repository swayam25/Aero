<script lang="ts">
    import { onNavigate } from "$app/navigation";
    import Navbar from "$lib/components/Navbar.svelte";
    import Player from "$lib/components/Player.svelte";
    import Sidebar from "$lib/components/Sidebar.svelte";
    import type { Snippet } from "svelte";
    import "../app.css";
    import type { PageData } from "./$types";

    interface Props {
        data: PageData;
        children: Snippet;
    }

    let { data, children }: Props = $props();

    onNavigate((navigation) => {
        if (!document.startViewTransition) return;

        return new Promise((resolve) => {
            document.startViewTransition(async () => {
                resolve();
                await navigation.complete;
            });
        });
    });
</script>

<div class="grid h-screen w-screen grid-rows-[auto_1fr_auto] overflow-hidden md:grid-cols-[5rem_auto] md:gap-2 md:p-2">
    <div class="col-span-2">
        <Navbar user={data.user} />
    </div>
    <div class="col-span-1 row-span-1">
        <Sidebar user={data.user} />
    </div>
    <div class="col-span-1 row-span-1 size-full overflow-x-hidden overflow-y-auto rounded-lg p-2 md:bg-slate-900 md:p-5">
        {@render children()}
    </div>
    <div class="col-span-2">
        <Player user={data.user} />
    </div>
</div>
