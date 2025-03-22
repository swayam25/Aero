<script lang="ts">
    import { cn } from "$lib/utils/cn";
    import type { Snippet } from "svelte";

    interface Props {
        type?: "normal" | "error" | "success";
        href?: string;
        disabled?: boolean;
        onclick?: (e: MouseEvent) => void;
        children: Snippet;
    }
    let { type = "normal", href, disabled, onclick = () => {}, children }: Props = $props();

    let typeClass = $derived.by(() => {
        switch (type) {
            case "error":
                return "not-disabled:hover:bg-red-500/10 not-disabled:hover:text-red-500";
            case "success":
                return "not-disabled:hover:bg-green-500/10 not-disabled:hover:text-green-500";
            default:
                return "not-disabled:hover:bg-slate-800";
        }
    });
</script>

<svelte:element
    this={href ? "a" : "button"}
    role={href ? "link" : "button"}
    tabindex="0"
    {href}
    {disabled}
    {onclick}
    class={cn(
        "group flex w-full items-center justify-start gap-2 rounded-lg px-2 py-1.5 transition-colors duration-200 not-disabled:cursor-pointer",
        typeClass
    )}
>
    {@render children()}
</svelte:element>
