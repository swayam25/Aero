<script lang="ts">
    import { cn } from "$lib/utils/cn";
    import type { Snippet } from "svelte";
    import { Drawer } from "vaul-svelte";

    interface Props {
        open: boolean;
        dismissible?: boolean;
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
        dismissible = true,
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
        children,
    }: Props = $props();
</script>

<Drawer.Root {onClose} {open} {dismissible}>
    <Drawer.Portal>
        <Drawer.Overlay
            onclick={() => {
                if (!dismissible) {
                    open = false;
                }
            }}
            class="fixed inset-0 bg-black/50"
            style="z-index: {zIndex - 1};"
        />
        <Drawer.Content
            class={cn(
                "fixed inset-x-0 flex flex-col rounded-t-2xl border-t border-slate-700",
                fullScreen ? "-top-4 right-0 left-0 h-[calc(100vh+1rem)]" : "bottom-0 mt-24 h-fit",
                backgroundImage ? "bg-slate-950" : "bg-slate-900",
                className,
            )}
            style="z-index: {zIndex}; {backgroundImage
                ? `background-image: url(${backgroundImage}); background-size: cover; background-position: center;`
                : ''}"
        >
            <!-- Background overlay for blur effect -->
            {#if backgroundImage}
                <div class={cn("absolute inset-0 rounded-t-2xl bg-slate-950/80", blur ? "backdrop-blur-2xl" : "")}></div>
            {/if}

            <!-- Content wrapper with relative positioning -->
            <div class="relative z-10 flex h-full flex-col">
                <!-- Handle -->
                {#if showHandle}
                    <button
                        aria-label="Close"
                        onpointerdown={() => {
                            if (!dismissible) {
                                open = false;
                            }
                        }}
                        class={cn("mx-auto h-2 w-12 rounded-full bg-slate-600", fullScreen ? "mt-8" : "mt-4")}
                    ></button>
                {/if}

                <!-- Header -->
                {#if title}
                    <div class={cn("relative flex items-center justify-center py-4", headerClass)}>
                        <h2 class="text-lg font-medium text-slate-200">{title}</h2>
                    </div>
                {/if}

                <!-- Content -->
                <div class={cn("overflow-y-autos overflow-x-hidden", fullScreen ? "flex-1 px-4 pb-4" : `px-4 pb-8 ${maxHeight}`, contentClass)}>
                    {@render children()}
                </div>
            </div>
        </Drawer.Content>
    </Drawer.Portal>
</Drawer.Root>
