<script lang="ts">
    import type { UserData } from "$lib/discord/types";
    import type { Component } from "svelte";
    import SolarHome2Linear from "~icons/solar/home-2-linear";
    import SolarMusicLibraryLinear from "~icons/solar/music-library-linear";
    import SolarUserCircleLinear from "~icons/solar/user-circle-linear";

    let { user }: { user: UserData | null } = $props();

    interface Item {
        name: string;
        icon: Component;
        href: string;
        hidden?: boolean;
    }
    let items: Item[] = [
        { name: "Home", icon: SolarHome2Linear, href: "/" },
        { name: "Playlists", icon: SolarMusicLibraryLinear, href: "/playlist" },
        { name: "Profile", icon: SolarUserCircleLinear, href: `/profile/${user?.id}`, hidden: !user },
    ];
</script>

<div class="fixed bottom-0 flex h-15 w-full items-center justify-evenly gap-2 rounded-t-lg bg-slate-950/80 p-5 px-10 backdrop-blur-xs">
    {#each items as item}
        {@const Icon = item.icon}
        <a href={item.href} class="flex cursor-pointer flex-col items-center justify-center gap-1 text-slate-200" class:hidden={item.hidden}>
            <Icon class="size-6" />
            <p class="text-xs font-bold">{item.name}</p>
        </a>
    {/each}
</div>
