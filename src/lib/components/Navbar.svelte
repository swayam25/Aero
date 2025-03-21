<script lang="ts">
    import { goto } from "$app/navigation";
    import type { UserData } from "$lib/discord/types";
    import { onMount } from "svelte";
    import SolarMagniferLinear from "~icons/solar/magnifer-linear";
    import UserButton from "./UserButton.svelte";

    let { user }: { user: UserData | null } = $props();

    let inputFocus: boolean = $state(false);
    let inputValue: string = $state("");
    let input: HTMLInputElement;
    $effect(() => {
        if (inputValue) goto("/search?q=" + inputValue, { keepFocus: true });
        else goto("/");
    });

    onMount(() => {
        document.addEventListener("keydown", (e) => {
            if (e.key === "/" && document.activeElement !== input) {
                e.preventDefault();
                input.focus();
            }
            if (e.key === "Escape" && document.activeElement === input) {
                input.blur();
            }
        });
    });
</script>

<nav class="flex h-15 items-center justify-between rounded-b-lg bg-slate-900 px-5 md:rounded-lg">
    <a href="/">
        <img src="/aero.webp" alt="Aero" class="size-8 md:size-10" />
    </a>
    <div
        class="flex h-10 items-center justify-center gap-4 rounded-lg border border-slate-700 bg-slate-800 p-2 transition-colors duration-200 md:w-80 lg:w-100"
        class:!border-slate-400={inputFocus}
    >
        <SolarMagniferLinear class="size-6 text-slate-400" />
        <input
            type="text"
            placeholder="Search"
            class="w-full border-none text-slate-200 ring-0 outline-none placeholder:text-slate-400"
            onfocusin={() => {
                inputFocus = true;
            }}
            onfocusout={() => {
                inputFocus = false;
            }}
            bind:this={input}
            bind:value={inputValue}
        />
    </div>

    <UserButton {user} />
</nav>
