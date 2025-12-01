<script lang="ts">
    import { cn } from "$lib/utils/cn";
    import type { Snippet } from "svelte";

    interface Props {
        text?: string;
        class?: string;
        pauseOnHover?: boolean;
        direction?: "left" | "right";
        speed?: number; // pixels per second
        pause?: boolean;
        fadeSides?: boolean;
        children?: Snippet;
    }

    let {
        text = "",
        class: className = "",
        pauseOnHover = true,
        direction = "left",
        speed = 5,
        pause = false,
        fadeSides = true,
        children,
    }: Props = $props();

    let containerWidth: number = $state(0);
    let marqueeWidth: number = $state(0);
    let prefersReducedMotion = $state(false);

    let duration = $derived.by(() =>
        marqueeWidth && containerWidth ? (marqueeWidth < containerWidth ? containerWidth / speed : marqueeWidth / speed) : 0,
    );

    let shouldAnimate = $derived.by(() => !!(marqueeWidth && containerWidth && marqueeWidth > containerWidth && !prefersReducedMotion && !pause));

    $effect(() => {
        if (typeof window !== "undefined") {
            const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
            prefersReducedMotion = mq.matches;
            const onChange = () => (prefersReducedMotion = mq.matches);
            mq.addEventListener("change", onChange);

            return () => {
                mq.removeEventListener("change", onChange);
            };
        }
    });

    let animationDirection = $derived.by(() => (direction === "left" ? "normal" : "reverse"));
    let pauseOnHoverState = $derived.by(() => (pauseOnHover ? "paused" : "running"));
</script>

<div
    class={cn("marquee-container relative flex h-fit w-full overflow-hidden", className)}
    bind:clientWidth={containerWidth}
    data-fade={fadeSides && shouldAnimate}
    style="--direction: {animationDirection}; --duration: {shouldAnimate
        ? duration + 's'
        : '0s'};  --pause-on-hover: {pauseOnHoverState}; --marquee-distance: {marqueeWidth}px;"
>
    <div class="marquee-wrapper" class:animate={shouldAnimate}>
        <div class="marquee" bind:clientWidth={marqueeWidth} data-testid="marquee-slot">
            {#if children}
                {@render children?.()}
            {:else}
                {text}
            {/if}
        </div>

        {#if shouldAnimate}
            <div class="marquee" aria-hidden="true">
                {#if children}
                    {@render children?.()}
                {:else}
                    {text}
                {/if}
            </div>
        {/if}
    </div>
</div>

<style>
    :root {
        --gap: 2rem;
    }

    .marquee-container {
        display: flex;
        width: 100%;
        overflow-x: hidden;
        flex-direction: row;
        position: relative;
    }

    .marquee-wrapper {
        display: flex;
        gap: var(--gap);
        flex-shrink: 0;
        animation-play-state: running;
        animation-direction: var(--direction, normal);
    }

    .marquee-container:hover .marquee-wrapper {
        animation-play-state: var(--pause-on-hover);
    }

    .marquee-wrapper.animate {
        animation: scroll var(--duration, 0s) linear infinite;
    }

    .marquee {
        flex: 0 0 auto;
        min-width: 0;
        display: flex;
        flex-direction: row;
        align-items: center;
    }

    @keyframes scroll {
        0% {
            transform: translateX(0);
        }
        100% {
            transform: translateX(calc(-100% - var(--gap)));
        }
    }

    .marquee-container[data-fade="true"] {
        mask-image: linear-gradient(to right, rgba(0, 0, 0, 0) 0%, rgba(0, 0, 0, 1) 10%, rgba(0, 0, 0, 1) 90%, rgba(0, 0, 0, 0) 100%);
        mask-size: 100% 100%;
        mask-repeat: no-repeat;
    }
</style>
