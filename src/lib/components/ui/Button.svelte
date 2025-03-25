<script lang="ts">
    import { cn } from "$lib/utils/cn";
    import type { Snippet } from "svelte";

    interface Props {
        class?: string;
        size?: "sm" | "md" | "lg" | "xl" | "";
        type?: "default" | "div";
        href?: string;
        disabled?: boolean;
        onclick?: () => void;
        children?: Snippet;
    }

    let {
        class: className = "",
        size = "md",
        type = "default",
        href = "",
        disabled = $bindable(false),
        onclick = () => {},
        children
    }: Props = $props();

    let sizeClass: string = $derived.by(() => {
        switch (size) {
            case "sm":
                return "text-sm px-2 py-1";
            case "md":
                return "text-base px-3 py-2";
            case "lg":
                return "text-lg px-4 py-3";
            case "xl":
                return "text-xl px-6 py-5";
            default:
                return "";
        }
    });
</script>

<svelte:element
    this={type === "default" ? (href ? "a" : "button") : type}
    role={type === "default" ? (href ? "link" : "button") : type}
    tabindex="0"
    class={cn(
        "flex cursor-pointer items-center justify-center gap-2 rounded-lg bg-slate-800 transition-all duration-200 hover:brightness-80",
        className,
        sizeClass
    )}
    {onclick}
    {href}
    {disabled}
    data-sveltekit-preload-data="hover"
>
    {@render children?.()}
</svelte:element>
