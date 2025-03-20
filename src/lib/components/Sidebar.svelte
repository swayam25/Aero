<script lang="ts">
    import type { UserData } from "$lib/discord/types";

    let { user }: { user: UserData } = $props();
</script>

<div class="flex size-full w-20 items-center justify-center rounded-lg bg-slate-900">
    <p class="font-bold" style="writing-mode: vertical-rl; text-orientation: upright;">SIDEBAR HERE</p>
</div>
