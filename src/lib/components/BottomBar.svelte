<script lang="ts">
    import type { UserData } from "$lib/discord/types";
    import type { Component } from "svelte";
    import SolarHome2Linear from "~icons/solar/home-2-linear";
    import SolarMusicLibraryLinear from "~icons/solar/music-library-linear";
    import SolarUserCircleLinear from "~icons/solar/user-circle-linear";

    let { user }: { user: UserData } = $props();

    let links: { name: string; href: string; icon: Component; hidden?: boolean }[] = [
        { name: "Home", href: "/", icon: SolarHome2Linear },
        { name: "Playlists", href: "/playlist", icon: SolarMusicLibraryLinear },
        { name: "Profile", href: `/profile/${user?.id}`, icon: SolarUserCircleLinear, hidden: !user }
    ];
</script>

<div class="fixed bottom-0 flex h-15 w-full items-center justify-evenly gap-2 rounded-t-lg bg-slate-950/50 p-5 px-10">
    {#each links as link}
        {@const Icon = link.icon}
        <a href={link.href} class="flex cursor-pointer flex-col items-center justify-center gap-1 text-slate-200" class:hidden={link.hidden}>
            <Icon class="size-6" />
            <p class="text-xs font-bold">{link.name}</p>
        </a>
    {/each}
</div>
