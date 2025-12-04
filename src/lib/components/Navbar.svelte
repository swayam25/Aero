<script lang="ts">
    import type { UserData } from "$lib/discord/types";
    import Search from "./Search.svelte";
    import UserButton from "./UserButton.svelte";

    let { user }: { user: UserData | null } = $props();
</script>

<nav class="flex h-15 w-full items-center justify-between gap-5 rounded-b-lg bg-slate-900 px-5 md:rounded-lg">
    <a href="/" class="shrink-0">
        <img src="/aero.webp" alt="Aero" class="size-8 md:size-10" />
    </a>

    <Search class="w-[50%]" />

    <UserButton {user} />
</nav>
