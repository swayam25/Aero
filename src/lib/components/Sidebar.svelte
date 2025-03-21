<script lang="ts">
    import type { UserData } from "$lib/discord/types";
    import SolarMagniferLinear from "~icons/solar/magnifer-linear";
    import Tooltip from "./Tooltip.svelte";

    let { user }: { user: UserData } = $props();
</script>

<div class="flex size-full w-20 items-start justify-center rounded-lg bg-slate-900 p-5 *:cursor-pointer">
    <Tooltip side="right">
        {#snippet trigger()}
            <div class="size-8 opacity-80 transition-opacity hover:opacity-100">
                <SolarMagniferLinear class="size-full" />
            </div>
        {/snippet}
        {#snippet content()}
            Search
        {/snippet}
    </Tooltip>
</div>
