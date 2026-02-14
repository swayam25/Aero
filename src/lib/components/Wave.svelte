<script lang="ts">
    import { animate } from "animejs";

    let { class: className = "" }: { class?: string } = $props();

    let containerRef: HTMLDivElement;

    $effect(() => {
        const rects = containerRef.querySelectorAll("rect");

        rects.forEach((rect, index) => {
            const animateBar = () => {
                const randomHeight = Math.random() * 12 + 2;
                const randomDuration = Math.random() * 200 + 250;

                animate(rect, {
                    height: randomHeight,
                    y: 14 - randomHeight,
                    duration: randomDuration,
                    ease: "inOutQuad",
                    onComplete: animateBar,
                });
            };

            setTimeout(animateBar, index * 50);
        });
    });
</script>

<div bind:this={containerRef} class={className}>
    <svg viewBox="0 0 14 14" fill="currentColor" xmlns="http://www.w3.org/2000/svg" class="size-full">
        <rect x="0" y="0" width="2" height="14" rx="1" />
        <rect x="4" y="4" width="2" height="10" rx="1" />
        <rect x="8" y="7" width="2" height="7" rx="1" />
        <rect x="12" y="10" width="2" height="4" rx="1" />
    </svg>
</div>
