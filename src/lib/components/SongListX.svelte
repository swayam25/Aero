<script lang="ts">
    import { createSongActions, openCtxMenu } from "$lib/ctxmenu";
    import type { UserData } from "$lib/discord/types";
    import { play } from "$lib/player";
    import { cn } from "$lib/utils/cn";
    import { fade } from "svelte/transition";
    import type { SongDetailed } from "ytmusic-api";
    import SolarAltArrowLeftLinear from "~icons/solar/alt-arrow-left-linear";
    import SolarAltArrowRightLinear from "~icons/solar/alt-arrow-right-linear";
    import Thumbnail from "./Thumbnail.svelte";

    interface Props {
        skeleton?: boolean;
        user?: UserData;
        songs?: SongDetailed[];
        class?: string;
    }
    let { skeleton = false, user, songs, class: className }: Props = $props();

    let songList: HTMLDivElement | null = $state(null);
    let isDragging: boolean = $state(false);
    let isPointerDown: boolean = $state(false);
    let startX: number = $state(0);
    let initialScrollLeft: number = $state(0);
    let lastMoveX: number = $state(0);
    let lastMoveTime: number = $state(0);
    let lastVelocity: number = $state(0); // px/ms
    let momentumId: number | null = $state(null);
    const threshold = 5; // px before starting drag

    function onPointerDown(e: PointerEvent) {
        if (!songList) return;
        if ((e as PointerEvent & { button?: number }).button !== undefined && (e as PointerEvent & { button?: number }).button !== 0) return;
        stopMomentum();
        isPointerDown = true;
        startX = e.clientX;
        lastMoveX = e.clientX;
        lastMoveTime = performance.now();
        initialScrollLeft = songList.scrollLeft;
    }

    function onPointerMove(e: PointerEvent) {
        if (!isPointerDown || !songList) return;
        const x = e.clientX;
        const walk = x - startX;
        if (!isDragging && Math.abs(walk) > threshold) {
            isDragging = true;
            try {
                songList.setPointerCapture(e.pointerId);
            } catch (err) {}
        }
        if (!isDragging) return;
        const now = performance.now();
        const dt = Math.max(now - lastMoveTime, 1);
        const dx = x - lastMoveX;
        lastVelocity = dx / dt; // px per ms
        songList.scrollLeft = initialScrollLeft - walk;
        lastMoveX = x;
        lastMoveTime = now;
        e.preventDefault();
    }

    function onPointerUp(e: PointerEvent) {
        if (!songList) return;
        if (isDragging) {
            startMomentum(lastVelocity);
        }
        isDragging = false;
        isPointerDown = false;
        try {
            songList.releasePointerCapture(e.pointerId);
        } catch (err) {}
    }

    function startMomentum(initialVelocityPxPerMs: number) {
        stopMomentum();
        if (!songList || Math.abs(initialVelocityPxPerMs) < 0.02) return;
        let v = initialVelocityPxPerMs; // px/ms
        let last = performance.now();
        function step(ts: number) {
            if (!songList) return;
            const dt = ts - last;
            last = ts;
            // Secolling v is px/ms, so multiply by dt to get px
            // Apply motion in negative because pointer movement is opposite of content movement
            const movePx = -v * dt;
            if (movePx !== 0) {
                songList.scrollLeft += movePx;
            }
            const frictionPerFrame = 0.92; // Base decay per 16ms frame
            const frames = Math.max(dt / 16, 1);
            v *= Math.pow(frictionPerFrame, frames);
            if (songList.scrollLeft <= 0 || songList.scrollLeft >= songList.scrollWidth - songList.clientWidth) {
                momentumId = null;
                return;
            }
            if (Math.abs(v) < 0.02) {
                momentumId = null;
                return;
            }
            momentumId = requestAnimationFrame(step);
        }
        momentumId = requestAnimationFrame(step);
    }

    function stopMomentum() {
        if (momentumId != null) {
            cancelAnimationFrame(momentumId);
            momentumId = null;
        }
    }

    function scrollSection(direction: "left" | "right") {
        if (songList) {
            // Cancel momentum so user can re-assert control
            stopMomentum();
            const left = direction === "left" ? songList.scrollLeft - 1000 : songList.scrollLeft + 1000;
            songList.scrollTo({ left, behavior: "smooth" });
        }
    }

    let scrollSide: "left" | "right" | null = $state("left");
    function handleScroll(e: Event) {
        if (!songList) return;
        const target = e.target as HTMLElement;
        if (target.scrollLeft === 0) {
            scrollSide = "left";
        } else if (target.scrollLeft + target.clientWidth >= target.scrollWidth) {
            scrollSide = "right";
        } else {
            scrollSide = null;
        }
    }

    let skeletonCount: number = $state(8);

    $effect(() => {
        const bodyWidth = document.getElementById("body")?.clientWidth;
        if (bodyWidth) {
            skeletonCount = Math.ceil(bodyWidth / 200);
        }
    });
</script>

{#if skeleton}
    <div class={cn("flex gap-2 overflow-x-auto overflow-y-hidden py-2 md:py-5", className)} style="scrollbar-width: none;">
        {#each Array(skeletonCount) as _}
            <div class="flex shrink-0 flex-col items-start justify-center gap-2 rounded-lg bg-slate-800 p-3">
                <div class="size-40 shrink-0 animate-pulse rounded-lg bg-slate-900 md:size-50"></div>
                <div class="flex size-full flex-col gap-1">
                    <div class="h-5 w-full animate-pulse rounded-lg bg-slate-900"></div>
                    <div class="h-5 w-[80%] animate-pulse rounded-lg bg-slate-900"></div>
                </div>
            </div>
        {/each}
    </div>
{:else if songs}
    <div class={cn("group relative", className)}>
        <div
            role="list"
            in:fade={{ duration: 100 }}
            bind:this={songList}
            onpointerdown={onPointerDown}
            onpointermove={onPointerMove}
            onpointerup={onPointerUp}
            onpointercancel={onPointerUp}
            onpointerleave={onPointerUp}
            onscroll={handleScroll}
            class={cn(
                "flex gap-2 overflow-x-auto overflow-y-hidden py-2 md:py-5",
                isDragging ? "cursor-grabbing select-none" : "cursor-grab",
                className,
            )}
            style="scrollbar-width: none; touch-action: pan-y;"
        >
            {#each songs as song}
                <button
                    class="group/btn flex shrink-0 cursor-pointer flex-col items-start justify-center gap-2 rounded-lg p-3 transition-colors duration-200 hover:bg-slate-800"
                    onclick={async () => {
                        if (isDragging) return;
                        await play(song, user?.id);
                    }}
                    oncontextmenu={async (e) => {
                        if (isDragging) return;
                        e.preventDefault();
                        const actions = createSongActions(song, user?.id);
                        openCtxMenu(e, actions);
                    }}
                >
                    <Thumbnail
                        src={song.thumbnails?.[0]?.url}
                        alt={song.name}
                        class="size-40 shrink-0 rounded-lg transition-colors duration-200 group-hover/btn:bg-slate-900 md:size-50"
                    />
                    <div class="w-40 text-left text-sm md:w-50">
                        <p class="min-w-0 truncate" title={song.name}>{song.name}</p>
                        <p class="min-w-0 truncate text-slate-400" title={song.artist.name}>
                            {song.artist.name}
                        </p>
                    </div>
                </button>
            {/each}

            <div
                class="pointer-events-none absolute inset-0 hidden items-center justify-between opacity-0 transition-opacity duration-400 group-hover:opacity-100 md:flex"
            >
                <button
                    onclick={() => {
                        if (isDragging) return;
                        scrollSection("left");
                    }}
                    class="pointer-events-auto left-0 flex h-full w-20 cursor-pointer items-center justify-center bg-linear-270 from-transparent to-slate-900/80 pr-10 transition-all duration-400"
                    class:pointer-events-none={scrollSide === "left"}
                    class:opacity-0={scrollSide === "left"}
                >
                    <SolarAltArrowLeftLinear class="size-7" />
                </button>
                <button
                    onclick={() => {
                        if (isDragging) return;
                        scrollSection("right");
                    }}
                    class="pointer-events-auto right-0 flex h-full w-20 cursor-pointer items-center justify-center -bg-linear-270 from-transparent to-slate-900/80 pl-10 transition-all duration-400"
                    class:pointer-events-none={scrollSide === "right"}
                    class:opacity-0={scrollSide === "right"}
                >
                    <SolarAltArrowRightLinear class="size-7" />
                </button>
            </div>
        </div>
    </div>
{/if}
