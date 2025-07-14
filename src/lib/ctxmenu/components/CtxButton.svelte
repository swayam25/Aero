<script lang="ts">
    import { cn } from "$lib/utils/cn";
    import type { Snippet } from "svelte";

    interface Props {
        type?: "normal" | "error" | "success" | "warning" | "skeleton" | "destructive";
        href?: string;
        class?: string;
        disabled?: boolean;
        onclick?: (e: MouseEvent) => void;
        onmouseenter?: (e: MouseEvent) => void;
        onmouseleave?: (e: MouseEvent) => void;
        children: Snippet;
        [key: string]: any; // For data attributes
    }
    let {
        type = "normal",
        href,
        class: className = "",
        disabled,
        onclick = () => {},
        onmouseenter = () => {},
        onmouseleave = () => {},
        children,
        ...rest
    }: Props = $props();

    let typeClass = $derived.by(() => {
        switch (type) {
            case "error":
            case "destructive":
                return "not-disabled:hover:bg-red-500/10 not-disabled:hover:text-red-500";
            case "success":
                return "not-disabled:hover:bg-green-500/10 not-disabled:hover:text-green-500";
            case "warning":
                return "not-disabled:hover:bg-yellow-500/10 not-disabled:hover:text-yellow-500";
            case "skeleton":
                return "cursor-default";
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
    {onmouseenter}
    {onmouseleave}
    {...rest}
    class={cn(
        "group flex w-full items-center justify-start gap-2 rounded-lg p-3 transition-colors duration-200 not-disabled:cursor-pointer disabled:cursor-not-allowed disabled:opacity-50 md:px-2 md:py-1.5",
        typeClass,
        className,
    )}
>
    {@render children()}
</svelte:element>
