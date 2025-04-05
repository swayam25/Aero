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
    let searchTimeout: NodeJS.Timeout | null = $state(null);

    onMount(() => {
        document.addEventListener("keydown", (e) => {
            if (e.key === "/" && document.activeElement !== input) {
                e.preventDefault();
                input?.focus();
            }
        });
        input?.addEventListener("keydown", (e) => {
            if (e.key === "Escape") {
                input?.blur();
            }
            if (!inputValue && e.key === "Backspace") {
                goto("/");
                input?.blur();
            }
            if (searchTimeout) clearTimeout(searchTimeout);
            searchTimeout = setTimeout(() => {
                if (inputValue) goto("/search?q=" + inputValue, { keepFocus: true });
            }, 500);
        });
    });
</script>

<nav class="flex h-15 w-full items-center justify-between gap-5 rounded-b-lg bg-slate-900 px-5 md:rounded-lg">
    <a href="/" class="shrink-0">
        <img src="/aero.webp" alt="Aero" class="size-8 md:size-10" />
    </a>
    <Input bind:value={inputValue} class="w-[60%] lg:w-[50%]" placeholder="Search" icon={SolarMagniferLinear} bind:ref={input} />

    <UserButton {user} />
</nav>
