<script lang="ts">
    import { Dialog } from "bits-ui";
    import type { Snippet } from "svelte";
    import { fade } from "svelte/transition";
    import IconParkOutlineClose from "~icons/icon-park-outline/close";

    interface Props {
        title: string;
        open?: boolean;
        trigger?: Snippet;
        description?: Snippet;
        fields: Snippet;
        actions?: Snippet;
        onOpenAutoFocus?: (e: Event) => void;
        onCloseAutoFocus?: (e: Event) => void;
        disabled?: boolean;
    }
    let {
        title,
        open = $bindable(false),
        trigger,
        description,
        fields,
        actions,
        onOpenAutoFocus,
        onCloseAutoFocus,
        disabled = false,
    }: Props = $props();
</script>

<Dialog.Root bind:open>
    {#if trigger}
        <Dialog.Trigger class="flex w-full items-center justify-center" {disabled}>
            {@render trigger()}
        </Dialog.Trigger>
    {/if}
    <Dialog.Portal>
        <Dialog.Overlay class="fixed inset-0 z-100 flex size-full items-center justify-center backdrop-blur-xs" forceMount>
            {#snippet child({ props, open })}
                {#if open}
                    <div {...props} transition:fade={{ duration: 100 }}>
                        <Dialog.Content
                            class="flex max-w-[90%] flex-col rounded-lg border border-slate-700 bg-slate-900 p-5 text-sm md:max-w-[50%]"
                            {onOpenAutoFocus}
                            onCloseAutoFocus={(e) => {
                                e.preventDefault();
                                onCloseAutoFocus?.(e);
                            }}
                        >
                            <div class="flex flex-col gap-2 text-left">
                                <div class="flex items-center justify-between gap-2">
                                    <Dialog.Title class="text-xl font-extrabold">{title}</Dialog.Title>
                                    <Dialog.Close class="cursor-pointer transition-all duration-200 hover:brightness-80">
                                        <IconParkOutlineClose class="size-6" />
                                    </Dialog.Close>
                                </div>
                                {#if description}
                                    <Dialog.Description class="mt-2 text-slate-200">
                                        {@render description()}
                                    </Dialog.Description>
                                {/if}
                                <div class="flex items-center justify-center">
                                    <div class="size-full">
                                        {@render fields()}
                                    </div>
                                </div>
                                {#if actions}
                                    <div
                                        class="flex flex-col items-center justify-between gap-2 *:flex *:w-full *:cursor-pointer *:items-center *:justify-center *:gap-2 *:rounded-lg *:bg-slate-800 *:px-3 *:py-2 *:transition-all *:duration-200 *:not-disabled:hover:bg-slate-800/50 *:disabled:brightness-80 md:flex-row md:gap-5"
                                    >
                                        {@render actions()}
                                    </div>
                                {/if}
                            </div>
                        </Dialog.Content>
                    </div>
                {/if}
            {/snippet}
        </Dialog.Overlay>
    </Dialog.Portal>
</Dialog.Root>
