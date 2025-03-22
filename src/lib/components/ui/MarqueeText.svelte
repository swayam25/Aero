<script lang="ts">
    import { cn } from "$lib/utils/cn";
    import { onDestroy } from "svelte";

    interface Props {
        text: string;
        class?: string;
        marqueeDirection?: "forward" | "backward";
    }
    let { text, class: className = "", marqueeDirection = "forward" }: Props = $props();

    let marqueeOffset: number = $state(0);
    let marqueeInterval: number;
    let speed: number = 50; // 50ms interval
    let delay: number = 5000; // 5s delay
    let textElement: HTMLElement;

    function startMarquee() {
        if (!textElement) return;

        const textWidth = textElement.scrollWidth;
        const containerWidth = textElement.parentElement?.offsetWidth || 0;

        // Only animate if the text overflows the container
        if (textWidth > containerWidth) {
            const step = 1; // Consistent step size for smooth animation
            if (marqueeDirection === "forward") {
                marqueeOffset = Math.min(marqueeOffset + step, textWidth - containerWidth); // Clamp forward offset
                if (marqueeOffset >= textWidth - containerWidth) {
                    marqueeDirection = "backward";
                    clearInterval(marqueeInterval); // Pause before reversing
                    setTimeout(() => {
                        marqueeInterval = window.setInterval(startMarquee, speed);
                    }, delay);
                }
            } else {
                marqueeOffset = Math.max(marqueeOffset - step, 0); // Clamp backward offset
                if (marqueeOffset <= 0) {
                    marqueeDirection = "forward";
                    clearInterval(marqueeInterval); // Pause before reversing
                    setTimeout(() => {
                        marqueeInterval = window.setInterval(startMarquee, speed);
                    }, delay);
                }
            }

            textElement.style.transform = `translateX(-${marqueeOffset}px)`;
        } else {
            marqueeOffset = 0; // Reset offset if no overflow
            textElement.style.transform = `translateX(0)`; // Reset position
        }
    }

    $effect(() => {
        if (text) {
            clearInterval(marqueeInterval); // Clear any existing interval
            marqueeOffset = 0; // Reset offset
            marqueeDirection = "forward"; // Reset direction
            if (textElement) {
                textElement.style.transform = `translateX(0)`; // Reset transform to avoid jitter
            }
            setTimeout(() => {
                marqueeInterval = window.setInterval(startMarquee, speed); // Restart animation after delay
            }, delay);
        }
    });

    onDestroy(() => {
        clearInterval(marqueeInterval);
    });
</script>

<div class="relative h-fit w-full overflow-hidden">
    <span bind:this={textElement} class={cn("h-fit whitespace-nowrap transition-transform ease-in-out", className)} style="display: inline-block;">
        {text}
    </span>
</div>
