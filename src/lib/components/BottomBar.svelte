<script lang="ts">
    import type { UserData } from "$lib/discord/types";
    import { userRoomStore } from "$lib/stores/userRoom";
    import type { Component } from "svelte";
    import SolarHome2Linear from "~icons/solar/home-2-linear";
    import SolarMagniferLinear from "~icons/solar/magnifer-linear";
    import SolarMusicLibraryLinear from "~icons/solar/music-library-linear";
    import SolarUsersGroupRoundedLinear from "~icons/solar/users-group-rounded-linear";
    import UserButton from "./UserButton.svelte";

    let { user }: { user: UserData | null } = $props();

    interface Item {
        name: string;
        icon: Component;
        color?: string;
        href: string;
        hidden?: boolean;
    }
    let items: Item[] = $derived([
        { name: "Home", icon: SolarHome2Linear, href: "/" },
        { name: "Playlists", icon: SolarMusicLibraryLinear, href: "/playlist", hidden: !user },
        { name: "Search", icon: SolarMagniferLinear, href: "/search" },
        {
            name: "Rooms",
            icon: SolarUsersGroupRoundedLinear,
            href: "/room",
            color: $userRoomStore ? "text-green-500" : "",
            hidden: !user,
        },
    ]);
</script>

<div
    class="fixed bottom-0 flex h-15 w-full items-center gap-2 rounded-t-lg bg-linear-to-t from-slate-950 to-slate-950/10 p-5 shadow-lg backdrop-blur-xs md:hidden"
    class:justify-between={user}
    class:justify-evenly={!user}
>
    {#each items as item}
        {@const Icon = item.icon}
        <a
            href={item.href}
            class="flex cursor-pointer flex-col items-center justify-center gap-1 {item.color || 'text-slate-200'}"
            class:hidden={item.hidden}
        >
            <Icon class="size-6 " />
            <p class="text-xs font-medium">{item.name}</p>
        </a>
    {/each}
    <UserButton {user} mobile />
</div>
