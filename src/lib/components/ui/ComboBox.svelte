<script lang="ts">
    import { cn } from "$lib/utils/cn";
    import { Combobox } from "bits-ui";
    import { type Component } from "svelte";
    import { fade, fly } from "svelte/transition";
    import IconParkOutlineClose from "~icons/icon-park-outline/close";
    import SolarAltArrowDownLinear from "~icons/solar/alt-arrow-down-linear";
    import SolarAltArrowUpLinear from "~icons/solar/alt-arrow-up-linear";
    import SolarConfoundedCircleLinear from "~icons/solar/confounded-circle-linear";
    import SolarUnreadLinear from "~icons/solar/unread-linear";

    interface Props {
        value: string;
        class?: string;
        placeholder?: string;
        icon?: Component;
        onEnter?: (value: string) => void;
        onInput?: (value: string) => void;
        ref?: HTMLInputElement | null;
        options: { label: string; value: string }[];
        open?: boolean;
    }
    let {
        value = $bindable(""),
        class: className,
        placeholder,
        icon,
        onEnter = (value: string) => {},
        onInput = (value: string) => {},
        ref = $bindable(),
        options = $bindable([]),
        open = $bindable(false),
    }: Props = $props();

    let inputFocus: boolean = $state(false);

    // Handle value changes when an item is selected
    function handleValueChange(newValue: string) {
        value = newValue;
        open = false;
        onEnter(newValue);
    }

    // Handle open state changes
    function handleOpenChange(newOpen: boolean) {
        open = newOpen;
    }
</script>

<Combobox.Root type="single" bind:value bind:open onOpenChange={handleOpenChange} onValueChange={handleValueChange}>
    <div
        class={cn(
            "flex h-10 items-center justify-center gap-4 rounded-lg border border-slate-700 bg-slate-800 p-2 transition-colors duration-200",
            className,
        )}
        class:!border-slate-400={inputFocus}
    >
        {#if icon}
            {#if !value}
                {@const Icon = icon}
                <span in:fade={{ duration: 100 }} class="size-6 text-slate-400">
                    <Icon class="size-full" />
                </span>
            {:else}
                <button
                    in:fade={{ duration: 100 }}
                    class="size-6 cursor-pointer text-slate-400 transition-opacity duration-200 hover:opacity-80"
                    onclick={() => {
                        value = "";
                        if (ref) {
                            ref.value = "";
                            onInput("");
                        }
                        ref?.focus();
                    }}
                >
                    <IconParkOutlineClose class="size-full" />
                </button>
            {/if}
        {/if}
        <Combobox.Input
            type="text"
            bind:ref
            {placeholder}
            class="w-full border-none text-slate-200 ring-0 outline-none placeholder:text-slate-400"
            onfocusin={() => {
                inputFocus = true;
            }}
            onfocusout={() => {
                inputFocus = false;
            }}
            onkeydown={(e) => {
                if (e.key === "Enter") {
                    onEnter(value);
                } else if (e.key === "Escape") {
                    ref?.blur();
                    open = false;
                }
            }}
            oninput={(e) => {
                const inputValue = (e.target as HTMLInputElement).value;
                value = inputValue;
                onInput(inputValue);
            }}
        />
    </div>

    <Combobox.Portal>
        <Combobox.Content
            sideOffset={15}
            class="z-50 max-h-(--bits-combobox-content-available-height) w-(--bits-combobox-anchor-width) min-w-(--bits-combobox-anchor-width) rounded-lg border border-slate-700 bg-slate-900 p-2 shadow-xl outline-hidden select-none"
        >
            {#snippet child({ wrapperProps, props, open })}
                {#if open}
                    <div {...wrapperProps}>
                        <div {...props} transition:fly={{ duration: 100 }}>
                            <Combobox.ScrollUpButton class="flex w-full items-center justify-center">
                                <SolarAltArrowUpLinear class="size-3" />
                            </Combobox.ScrollUpButton>

                            <Combobox.Viewport class="flex flex-col items-center justify-center gap-2">
                                {#each options as opt, i (i + opt.value)}
                                    <Combobox.Item
                                        class="flex w-full items-center rounded p-1 text-sm outline-hidden transition-colors duration-200 select-none data-highlighted:bg-slate-800"
                                        value={opt.value}
                                        label={opt.label}
                                    >
                                        {#snippet children({ selected })}
                                            <span class="block" class:font-medium={selected}>
                                                {opt.label}
                                            </span>
                                            {#if selected}
                                                <div class="ml-auto">
                                                    <SolarUnreadLinear />
                                                </div>
                                            {/if}
                                        {/snippet}
                                    </Combobox.Item>
                                {:else}
                                    {#await new Promise((resolve) => setTimeout(resolve, 5000))}
                                        {#each Array(3) as _, i}
                                            <div
                                                class="h-7 w-full shrink-0 animate-pulse rounded bg-slate-700/60"
                                                style="animation-delay: {i * 0.1 + 0.05}s"
                                            ></div>
                                        {/each}
                                    {:then}
                                        <div class="flex w-full items-center justify-center gap-2 text-slate-400">
                                            <SolarConfoundedCircleLinear />
                                            <p>No results found</p>
                                        </div>
                                    {/await}
                                {/each}
                            </Combobox.Viewport>
                            <Combobox.ScrollDownButton class="flex w-full items-center justify-center">
                                <SolarAltArrowDownLinear class="size-3" />
                            </Combobox.ScrollDownButton>
                        </div>
                    </div>
                {/if}
            {/snippet}
        </Combobox.Content>
    </Combobox.Portal>
</Combobox.Root>
