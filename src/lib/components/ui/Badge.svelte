<script lang="ts">
    import type { SelectUser } from "$lib/db/schema";
    import { cn } from "$lib/utils/cn";
    import type { Component } from "svelte";
    import SolarCode2Linear from "~icons/solar/code-2-linear";
    import SolarCrownLineLinear from "~icons/solar/crown-line-linear";
    import SolarSledgehammerOutline from "~icons/solar/sledgehammer-outline";
    import SolarUserOutline from "~icons/solar/user-outline";

    interface Props {
        role: SelectUser["role"];
        size?: "xs" | "sm" | "md" | "lg" | "icon";
    }
    let { role, size = "sm" }: Props = $props();

    interface IconData {
        icon: Component;
        color: string;
    }

    let iconData: IconData = $derived.by(() => {
        switch (role) {
            case "owner":
                return {
                    icon: SolarCrownLineLinear,
                    color: "bg-yellow-500/10 text-yellow-500",
                };
            case "dev":
                return {
                    icon: SolarCode2Linear,
                    color: "bg-green-500/10 text-green-500",
                };
            case "staff":
                return {
                    icon: SolarSledgehammerOutline,
                    color: "bg-rose-500/10 text-rose-500",
                };
            case "user":
            default:
                return {
                    icon: SolarUserOutline,
                    color: "bg-sky-500/10 text-sky-500",
                };
        }
    });

    let sizeClass: string = $derived.by(() => {
        switch (size) {
            case "xs":
                return "px-1.5 py-0.5 text-xs";
            case "sm":
                return "px-2 py-1 text-sm";
            case "md":
                return "px-3 py-1.5 text-base";
            case "lg":
                return "px-4 py-2 text-lg";
            case "icon":
                return "p-2";
            default:
                return "";
        }
    });
</script>

{#if role}
    {@const { icon: Icon, color } = iconData}
    <div class={cn("inline-flex items-center gap-1 rounded-lg", color, sizeClass)}>
        <Icon class="size-full" />
        {#if size !== "icon"}
            <span>{String(role)[0].toUpperCase() + String(role).slice(1)}</span>
        {/if}
    </div>
{/if}
