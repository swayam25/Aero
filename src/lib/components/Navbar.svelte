<script lang="ts">
    import { goto } from "$app/navigation";
    import type { UserData } from "$lib/discord/types";
    import { onMount } from "svelte";
    import SolarMagniferLinear from "~icons/solar/magnifer-linear";
    import Input from "./ui/Input.svelte";
    import UserButton from "./UserButton.svelte";

    let { user }: { user: UserData | null } = $props();

    let input: HTMLInputElement | null = $state(null);
    let inputValue: string = $state("");
    $effect(() => {
        if (inputValue) goto("/search?q=" + inputValue, { keepFocus: true });
    });

    onMount(() => {
        $effect(() => {
            document.addEventListener("keydown", (e) => {
                if (e.key === "/" && document.activeElement !== input) {
                    e.preventDefault();
                    input?.focus();
                }
                if (e.key === "Escape" && document.activeElement === input) {
                    input?.blur();
                }
                if (!inputValue && document.activeElement === input && e.key === "Backspace") {
                    goto("/");
                    input?.blur();
                }
            });
        });
    });
</script>

<nav class="flex h-15 w-full items-center justify-between gap-5 rounded-b-lg bg-slate-900 px-5 md:rounded-lg">
    <a href="/" class="shrink-0">
        <img src="/aero.webp" alt="Aero" class="size-8 md:size-10" />
    </a>
    <div class="absolute right-0 left-0 flex flex-1 items-center justify-center">
        <Input bind:value={inputValue} class="w-[60%] lg:w-[50%]" placeholder="Search" icon={SolarMagniferLinear} bind:ref={input} />
    </div>

    <UserButton {user} />
</nav>
