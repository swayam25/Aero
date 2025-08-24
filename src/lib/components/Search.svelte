<script lang="ts">
    import { goto } from "$app/navigation";
    import { onMount } from "svelte";
    import SolarMagniferLinear from "~icons/solar/magnifer-linear";
    import ComboBox from "./ui/ComboBox.svelte";

    interface Props {
        class?: string;
    }
    let { class: className }: Props = $props();

    let input: HTMLInputElement | null = $state(null);
    let inputValue: string = $state("");
    let searchSuggestions: { label: string; value: string }[] = $state([]);
    let open: boolean = $state(false);

    // Create enhanced options with current search as default first option
    const allOptions = $derived(() => {
        const trimmedSearch = inputValue.trim();
        if (!trimmedSearch) return searchSuggestions;

        const searchExists = searchSuggestions.some(
            (opt) => opt.value.toLowerCase() === trimmedSearch.toLowerCase() || opt.label.toLowerCase() === trimmedSearch.toLowerCase(),
        );

        if (!searchExists) {
            return [{ value: trimmedSearch, label: trimmedSearch }, ...searchSuggestions];
        }

        return searchSuggestions;
    });

    // Handle input changes for search suggestions
    let debounceTimer: NodeJS.Timeout | null = $state(null);

    async function handleInput(searchValue: string) {
        inputValue = searchValue;

        // Clear existing timer
        if (debounceTimer) {
            clearTimeout(debounceTimer);
        }

        if (searchValue.trim()) {
            // Set new timer for 50ms cooldown
            debounceTimer = setTimeout(async () => {
                try {
                    const resp = await fetch(`/api/search?q=${encodeURIComponent(searchValue)}`);
                    const data = await resp.json();
                    searchSuggestions = data.map((item: string) => ({
                        label: item,
                        value: item,
                    }));
                    open = true;
                } catch (error) {
                    console.error("Failed to fetch search suggestions:", error);
                    searchSuggestions = [];
                }
            }, 100);
        } else {
            searchSuggestions = [];
            open = false;
        }
    }

    function handleSearch(query: string) {
        console.log("Searching for:", query);
        if (query.trim()) {
            goto(`/search?q=${encodeURIComponent(query)}`, { keepFocus: true });
        }
    }

    onMount(() => {
        document.addEventListener("keydown", (e: KeyboardEvent) => {
            if (e.key === "/" && document.activeElement !== input) {
                e.preventDefault();
                input?.focus();
            }
        });
    });
</script>

<ComboBox
    bind:value={inputValue}
    class={className}
    placeholder="Search"
    icon={SolarMagniferLinear}
    bind:ref={input}
    onEnter={handleSearch}
    onInput={handleInput}
    options={allOptions()}
    bind:open
/>
