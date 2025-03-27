<script lang="ts">
    import { cn } from "$lib/utils/cn";
    import type { Component } from "svelte";

    interface Props {
        value: string;
        class?: string;
        placeholder?: string;
        icon?: Component;
        max?: number;
        onEnter?: () => void;
        ref?: HTMLInputElement | null;
    }
    let { value = $bindable(""), class: className, placeholder, icon, max, onEnter = () => {}, ref = $bindable() }: Props = $props();

    let inputFocus: boolean = $state(false);
</script>

<div
    class={cn(
        "flex h-10 items-center justify-center gap-4 rounded-lg border border-slate-700 bg-slate-800 p-2 transition-colors duration-200",
        className
    )}
    class:!border-slate-400={inputFocus}
>
    {#if icon}
        {@const Icon = icon}
        <Icon class="size-6 text-slate-400" />
    {/if}
    <input
        type="text"
        {placeholder}
        class="w-full border-none text-slate-200 ring-0 outline-none placeholder:text-slate-400"
        onfocusin={() => {
            inputFocus = true;
        }}
        onfocusout={() => {
            inputFocus = false;
        }}
        bind:this={ref}
        bind:value
        maxlength={max}
        onkeydown={(e) => {
            if (e.key === "Enter") {
                onEnter();
            }
        }}
    />
    {#if max}
        <span class="text-slate-400">{value.length}/{max}</span>
    {/if}
</div>
