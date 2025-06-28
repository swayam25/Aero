<script lang="ts">
    import { cn } from "$lib/utils/cn";
    import type { Snippet } from "svelte";
    import { Drawer } from "vaul-svelte";

    interface Props {
        open: boolean;
        onClose?: () => void;
        title?: string;
        showHandle?: boolean;
        maxHeight?: string;
        fullScreen?: boolean;
        class?: string;
        headerClass?: string;
        contentClass?: string;
        backgroundImage?: string;
        blur?: boolean;
        zIndex?: number;
        children: Snippet;
    }

    let {
        open,
        onClose = () => {},
        title = "",
        showHandle = true,
        maxHeight = "max-h-96",
        fullScreen = false,
        class: className = "",
        headerClass = "",
        contentClass = "",
        backgroundImage = "",
        blur = false,
        zIndex = 1000,
        children
    }: Props = $props();
</script>

<Drawer.Root {open} {onClose}>
    <Drawer.Portal>
        <Drawer.Overlay class="fixed inset-0 bg-black/50" style="z-index: {zIndex - 1};" />
        <Drawer.Content
            class={cn(
                "fixed inset-x-0 flex flex-col",
                fullScreen ? "inset-0 h-screen" : "bottom-0 mt-24 h-fit rounded-t-2xl border-t border-slate-700",
                backgroundImage ? "bg-slate-950" : "bg-slate-900",
                className
            )}
            style="z-index: {zIndex}; {backgroundImage
                ? `background-image: url(${backgroundImage}); background-size: cover; background-position: center;`
                : ''}"
        >
            <!-- Background overlay for blur effect -->
            {#if backgroundImage}
                <div class={cn("absolute inset-0 bg-slate-950/80", blur ? "backdrop-blur-2xl" : "", fullScreen ? "" : "rounded-t-2xl")}></div>
            {/if}

            <!-- Content wrapper with relative positioning -->
            <div class="relative z-10 flex h-full flex-col">
                <!-- Handle -->
                {#if showHandle}
                    <div class="mx-auto mt-4 h-2 w-12 rounded-full bg-slate-600"></div>
                {/if}

                <!-- Header -->
                {#if title}
                    <div class={cn("relative flex items-center justify-center py-5", headerClass)}>
                        <h2 class="text-lg font-medium text-slate-200">{title}</h2>
                    </div>
                {/if}

                <!-- Content -->
                <div class={cn("overflow-y-auto", fullScreen ? "flex-1 px-4 pb-4" : `px-4 pb-8 ${maxHeight}`, contentClass)}>
                    {@render children()}
                </div>
            </div>
        </Drawer.Content>
    </Drawer.Portal>
</Drawer.Root>
