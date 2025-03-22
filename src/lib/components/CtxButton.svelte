<script lang="ts">
    import { cn } from "$lib/utils/cn";
    import type { Snippet } from "svelte";

    interface Props {
        type?: "normal" | "error" | "success";
        href?: string;
        onclick?: () => void;
        children: Snippet;
    }
    let { type = "normal", href, onclick = () => {}, children }: Props = $props();

    let typeClass = $derived.by(() => {
        switch (type) {
            case "error":
                return "hover:bg-red-500/10 hover:text-red-500";
            case "success":
                return "hover:bg-green-500/10 hover:text-green-500";
            default:
                return "hover:bg-slate-800";
        }
    });
</script>

<svelte:element
    this={href ? "a" : "button"}
    role={href ? "link" : "button"}
    tabindex="0"
    {href}
    {onclick}
    class={cn("flex w-full cursor-pointer items-center justify-start gap-2 rounded-lg px-2 py-1.5 transition-colors duration-200", typeClass)}
>
    {@render children()}
</svelte:element>
