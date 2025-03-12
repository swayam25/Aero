<script lang="ts">
    import type { UserData } from "$lib/discord/types";
    import UserButton from "./UserButton.svelte";

    let { user }: { user: UserData | null } = $props();
</script>

<nav class="flex h-15 items-center justify-between rounded-b-lg bg-slate-900 px-5 md:rounded-lg">
    <a href="/">
        <img src="/aero.webp" alt="Aero" class="size-8 md:size-10" />
    </a>
    <UserButton {user} />
</nav>
