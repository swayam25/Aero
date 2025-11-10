<script lang="ts">
    import { cn } from "$lib/utils/cn";
    import type { Component } from "svelte";
    import { fade } from "svelte/transition";
    import MaterialSymbolsCloseRounded from "~icons/material-symbols/close-rounded";

    interface Props {
        value: string;
        class?: string;
        placeholder?: string;
        icon?: Component;
        max?: number;
        onEnter?: () => void;
        disabled?: boolean;
        ref?: HTMLInputElement | null;
    }
    let {
        value = $bindable(""),
        class: className,
        placeholder,
        icon,
        max,
        onEnter = () => {},
        disabled = false,
        ref = $bindable(),
    }: Props = $props();

    let inputFocus: boolean = $state(false);
</script>

<div
    class={cn(
        "flex h-10 items-center justify-center gap-4 rounded-lg border border-slate-700 bg-slate-800 p-2 transition-colors duration-200",
        className,
    )}
    class:!border-slate-400={inputFocus}
    class:brightness-80={disabled}
    class:cursor-not-allowed={disabled}
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
                    ref?.focus();
                }}
            >
                <MaterialSymbolsCloseRounded class="size-full" />
            </button>
        {/if}
    {/if}
    <input
        type="text"
        {placeholder}
        class="w-full border-none text-slate-200 ring-0 outline-none placeholder:text-slate-400 disabled:cursor-not-allowed"
        onfocusin={() => {
            if (!disabled) inputFocus = true;
        }}
        onfocusout={() => {
            if (!disabled) inputFocus = false;
        }}
        bind:this={ref}
        bind:value
        maxlength={max}
        onkeydown={(e) => {
            if (e.key === "Enter") {
                onEnter();
            } else if (e.key === "Escape") {
                ref?.blur();
            }
        }}
        {disabled}
    />
    {#if max}
        <span class="text-slate-400">{value.length}/{max}</span>
    {/if}
</div>
