<script lang="ts">
    import SongListX from "$lib/components/SongListX.svelte";
    import Seo from "$lib/components/ui/Seo.svelte";
    import { onMount } from "svelte";
    import MaterialSymbolsDirectionsRunRounded from "~icons/material-symbols/directions-run-rounded";
    import MaterialSymbolsFavoriteRounded from "~icons/material-symbols/favorite-rounded";
    import MaterialSymbolsGrassRounded from "~icons/material-symbols/grass-rounded";
    import MaterialSymbolsSunnyRounded from "~icons/material-symbols/sunny-rounded";
    import MaterialSymbolsTrophyRounded from "~icons/material-symbols/trophy-rounded";
    import type { PageData } from "./$types";

    let { data }: { data: PageData } = $props();

    // Calculate initial limit immediately when component loads
    const getInitialLimit = () => {
        if (typeof window === "undefined") return 8;
        const screenHeight = window.innerHeight;
        const categoryHeight = 350;
        const estimatedCategories = Math.ceil(screenHeight / categoryHeight);
        return Math.min(Math.max(estimatedCategories, 8), 10);
    };

    let initialLimit = $state(8);
    let allSongs: Record<string, any> = $state({});
    let currentOffset = $state(0);
    let isLoading = $state(false);
    let hasMore = $state(true);
    let loadingElement: HTMLDivElement | null = $state(null);
    let initialLoaded = $state(false);

    // Funny end messages with icons
    const endMessages = [
        {
            icon: MaterialSymbolsGrassRounded,
            color: "text-green-500",
            title: "That's all, music addict!",
            subtitle: "Time to touch some grass... it's green and crunchy!"
        },
        {
            icon: MaterialSymbolsSunnyRounded,
            color: "text-amber-500",
            title: "Congratulations! You've reached the end!",
            subtitle: "Now go see what that bright yellow thing in the sky is!"
        },
        {
            icon: MaterialSymbolsDirectionsRunRounded,
            color: "text-blue-500",
            title: "You've scrolled enough for today!",
            subtitle: "Your thumb needs a break. Try using your legs instead!"
        },
        {
            icon: MaterialSymbolsFavoriteRounded,
            color: "text-red-500",
            title: "Music overload detected!",
            subtitle: "Step outside before you turn into a playlist!"
        },
        {
            icon: MaterialSymbolsTrophyRounded,
            color: "text-yellow-500",
            title: "Bottom of the internet achieved!",
            subtitle: "Reward: Vitamin D deficiency. Go fix that!"
        }
    ];
    const randomMessage = $state(endMessages[Math.floor(Math.random() * endMessages.length)]);

    async function loadMoreCategories(limit = 8) {
        if (isLoading || !hasMore) return;
        isLoading = true;
        try {
            const response = await fetch(`/api/songs/categories?offset=${currentOffset}&limit=${limit}`);
            const result = await response.json();
            if (response.ok) {
                allSongs = { ...allSongs, ...result.categories };
                currentOffset += Object.keys(result.categories).length;
                hasMore = result.hasMore;
            } else {
                hasMore = false;
            }
        } catch (error) {
            hasMore = false;
        } finally {
            isLoading = false;
        }
    }

    onMount(() => {
        // Set the initial limit based on screen size
        initialLimit = getInitialLimit();
        // Load categories immediately with the calculated limit
        loadMoreCategories(initialLimit).then(() => {
            initialLoaded = true;
        });
        const observer = new IntersectionObserver(
            (entries) => {
                if (entries[0].isIntersecting && hasMore && !isLoading && initialLoaded) {
                    loadMoreCategories();
                }
            },
            { threshold: 0.1, rootMargin: "100px" }
        );
        // Backup scroll event listener to handle edge cases
        const handleScroll = () => {
            if (!hasMore || isLoading || !initialLoaded) return;
            const scrollPosition = window.scrollY + window.innerHeight;
            const documentHeight = document.documentElement.scrollHeight;

            // Trigger loading when user is within 200px of the bottom
            if (scrollPosition >= documentHeight - 200) {
                loadMoreCategories();
            }
        };
        // Add scroll event listener
        window.addEventListener("scroll", handleScroll, { passive: true });
        $effect(() => {
            if (loadingElement) observer.observe(loadingElement);
        });
        return () => {
            observer.disconnect();
            window.removeEventListener("scroll", handleScroll);
        };
    });
</script>

<Seo />

<div class="flex flex-col gap-4 md:gap-8">
    {#if !initialLoaded && Object.keys(allSongs).length === 0}
        {#each Array(initialLimit) as _}
            <div class="text-left">
                <div class="mb-2 h-8 w-48 animate-pulse rounded-lg bg-slate-800 md:h-10 md:w-64"></div>
                <SongListX skeleton />
            </div>
        {/each}
    {:else}
        {#each Object.keys(allSongs) as categoryName}
            <div class="text-left">
                <h1 class="text-3xl font-bold md:text-4xl">{categoryName}</h1>
                <SongListX user={data.user} songs={allSongs[categoryName]} />
            </div>
        {/each}
    {/if}

    {#if hasMore && initialLoaded}
        <div bind:this={loadingElement} class="flex flex-col gap-4 md:gap-8">
            {#if isLoading}
                {#each Array(3) as _}
                    <div class="text-left">
                        <div class="mb-2 h-8 w-48 animate-pulse rounded-lg bg-slate-800 md:h-10 md:w-64"></div>
                        <SongListX skeleton />
                    </div>
                {/each}
            {/if}
        </div>
    {:else if !hasMore && initialLoaded}{/if}
    <div class="flex flex-col items-center justify-center py-10 text-center">
        <div class="flex flex-col items-center justify-center gap-2">
            <randomMessage.icon class="size-10 {randomMessage.color}" />
            <div class="flex flex-col items-center justify-center">
                <h2 class="text-xl font-bold text-white md:text-2xl">{randomMessage.title}</h2>
                <p class="text-lg text-slate-400">{randomMessage.subtitle}</p>
            </div>
        </div>
    </div>
</div>
