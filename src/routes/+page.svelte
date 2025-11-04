<script lang="ts">
    import SongListX from "$lib/components/SongListX.svelte";
    import Seo from "$lib/components/ui/Seo.svelte";
    import { songsCache } from "$lib/stores";
    import { onMount } from "svelte";
    import MaterialSymbolsDirectionsRunRounded from "~icons/material-symbols/directions-run-rounded";
    import MaterialSymbolsFavoriteRounded from "~icons/material-symbols/favorite-rounded";
    import MaterialSymbolsGrassRounded from "~icons/material-symbols/grass-rounded";
    import MaterialSymbolsSunnyRounded from "~icons/material-symbols/sunny-rounded";
    import MaterialSymbolsTrophyRounded from "~icons/material-symbols/trophy-rounded";
    import type { PageData } from "./$types";

    let { data }: { data: PageData } = $props();

    // Constants
    const BATCH_SIZE = 8; // Used for initial and subsequent fetches
    const SCROLL_THRESHOLD = 800; // Trigger when 800px from bottom
    const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

    // Calculate optimal initial batch size based on viewport
    const getOptimalBatchSize = (): number => {
        if (typeof window === "undefined") return BATCH_SIZE;
        const viewportHeight = window.innerHeight;
        const categoryHeight = 350; // Approximate height
        const visibleCategories = Math.ceil(viewportHeight / categoryHeight);
        // Load 1.5x viewport to ensure content fills screen + some buffer
        return Math.min(Math.max(Math.ceil(visibleCategories * 1.5), BATCH_SIZE), 12);
    };

    // State management
    let categories: Record<string, any> = $state({});
    let currentOffset = $state(0);
    let hasMore = $state(true);
    let isInitialized = $state(false);

    // Loading state with debounce tracking
    let activeRequests = $state(0);
    let lastFetchTime = $state(0);
    const MIN_FETCH_INTERVAL = 300; // Minimum 300ms between fetches

    const isLoading = $derived(activeRequests > 0);
    const showContent = $derived(isInitialized && Object.keys(categories).length > 0);

    // Funny end messages
    const endMessages = [
        {
            icon: MaterialSymbolsGrassRounded,
            color: "text-green-500",
            title: "That's all, music addict!",
            subtitle: "Time to touch some grass... it's green and crunchy!",
        },
        {
            icon: MaterialSymbolsSunnyRounded,
            color: "text-amber-500",
            title: "Congratulations! You've reached the end!",
            subtitle: "Now go see what that bright yellow thing in the sky is!",
        },
        {
            icon: MaterialSymbolsDirectionsRunRounded,
            color: "text-blue-500",
            title: "You've scrolled enough for today!",
            subtitle: "Your thumb needs a break. Try using your legs instead!",
        },
        {
            icon: MaterialSymbolsFavoriteRounded,
            color: "text-red-500",
            title: "Music overload detected!",
            subtitle: "Step outside before you turn into a playlist!",
        },
        {
            icon: MaterialSymbolsTrophyRounded,
            color: "text-yellow-500",
            title: "Bottom of the internet achieved!",
            subtitle: "Reward: Vitamin D deficiency. Go fix that!",
        },
    ];
    const randomMessage = $state(endMessages[Math.floor(Math.random() * endMessages.length)]);

    async function fetchCategories(limit: number = BATCH_SIZE): Promise<boolean> {
        // Prevent concurrent/rapid requests
        const now = Date.now();
        if (now - lastFetchTime < MIN_FETCH_INTERVAL) {
            return false;
        }
        if (!hasMore || activeRequests > 0) {
            return false;
        }
        activeRequests++;
        lastFetchTime = now;

        const scrollBefore = window.scrollY;
        try {
            const response = await fetch(`/api/songs/categories?offset=${currentOffset}&limit=${limit}`);
            if (!response.ok) {
                console.error("Failed to fetch categories:", response.statusText);
                hasMore = false;
                return false;
            }
            const result = await response.json();
            const newCategories = result.categories;
            const newCategoryCount = Object.keys(newCategories).length;
            if (newCategoryCount === 0) {
                hasMore = false;
                return false;
            }
            categories = { ...categories, ...newCategories };
            currentOffset += newCategoryCount;
            hasMore = result.hasMore;
            songsCache.updateCache(newCategories, currentOffset, hasMore);

            // Restore scroll position to prevent jumping
            requestAnimationFrame(() => {
                if (scrollBefore > 0) {
                    window.scrollTo(0, scrollBefore);
                }
            });
            return true;
        } catch (error) {
            console.error("Error fetching categories:", error);
            hasMore = false;
            return false;
        } finally {
            activeRequests--;
        }
    }

    function shouldLoadMore(): boolean {
        if (!isInitialized || !hasMore || activeRequests > 0) return false;

        const scrollTop = window.scrollY;
        const windowHeight = window.innerHeight;
        const docHeight = document.documentElement.scrollHeight;

        // Load more when within SCROLL_THRESHOLD pixels from bottom
        return scrollTop + windowHeight >= docHeight - SCROLL_THRESHOLD;
    }

    async function initialize() {
        const cache = $songsCache;
        // Restore from cache if valid
        if (cache && !songsCache.isStale(cache, CACHE_TTL)) {
            categories = cache.categories;
            currentOffset = cache.currentOffset;
            hasMore = cache.hasMore;
            isInitialized = true;
            return;
        }
        const initialBatch = getOptimalBatchSize();
        await fetchCategories(initialBatch);
        isInitialized = true;
    }

    onMount(() => {
        initialize();
    });

    $effect(() => {
        if (shouldLoadMore()) {
            fetchCategories();
        }
    });
</script>

<Seo />

<!-- Initial loading skeleton -->
{#if !showContent}
    {#each Array(BATCH_SIZE) as _}
        <div class="text-left">
            <div class="mb-2 h-8 w-48 animate-pulse rounded-lg bg-slate-800 md:h-10 md:w-64"></div>
            <SongListX skeleton />
        </div>
    {/each}
{/if}

<!-- Loaded content -->
{#if showContent}
    {#each Object.keys(categories) as categoryName}
        <div class="text-left">
            <h1 class="text-3xl font-bold md:text-4xl">{categoryName}</h1>
            <SongListX user={data.user} songs={categories[categoryName]} />
        </div>
    {/each}
{/if}

<!-- Loading indicator -->
{#if hasMore && isInitialized && isLoading}
    <div class="flex flex-col gap-4 md:gap-8">
        {#each Array(BATCH_SIZE) as _}
            <div class="text-left">
                <div class="mb-2 h-8 w-48 animate-pulse rounded-lg bg-slate-800 md:h-10 md:w-64"></div>
                <SongListX skeleton />
            </div>
        {/each}
    </div>
{/if}

<!-- End of content message -->
{#if !hasMore && isInitialized}
    <div class="flex flex-col items-center justify-center py-10 text-center">
        <div class="flex flex-col items-center justify-center gap-2">
            <randomMessage.icon class="size-10 {randomMessage.color}" />
            <div class="flex flex-col items-center justify-center">
                <h2 class="text-xl font-bold text-white md:text-2xl">{randomMessage.title}</h2>
                <p class="text-lg text-slate-400">{randomMessage.subtitle}</p>
            </div>
        </div>
    </div>
{/if}
