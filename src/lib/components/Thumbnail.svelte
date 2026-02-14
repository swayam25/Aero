<script lang="ts">
    import { requestQueue } from "$lib/utils/requestQueue";
    import { onMount } from "svelte";

    interface Props {
        src: string | undefined | null;
        alt?: string;
        class?: string;
        style?: string;
        priority?: boolean;
    }

    let { src, alt = "", class: className = "", style = "", priority = false }: Props = $props();

    let imgElement: HTMLDivElement;
    let loaded = $state(false);
    let error = $state(false);
    let useProxy = $state(false);
    let currentSrc = $state<string | undefined | null>(null);
    let observer: IntersectionObserver | null = null;

    // Clean YouTube thumbnail URL by removing size parameters
    function cleanThumbnailUrl(url: string): string {
        if (!url) return "";
        return url.replace(/=w\d+-h\d+(-[a-z](\d+)?)*-rj/g, "");
    }

    function getProxyUrl(url: string): string {
        return `/api/thumbnail?url=${encodeURIComponent(url)}`;
    }

    // Reset and reload when src changes
    $effect(() => {
        if (src !== currentSrc) {
            currentSrc = src;
            loaded = false;
            error = false;
            useProxy = false;

            if (imgElement) {
                imgElement.style.backgroundImage = "";

                // If priority, load immediately, otherwise let the observer handle it
                if (priority) {
                    loadImage();
                } else if (observer && imgElement) {
                    // Re-check visibility for lazy-loaded images
                    const rect = imgElement.getBoundingClientRect();
                    const isVisible = rect.top < window.innerHeight + 200 && rect.bottom > -200;
                    if (isVisible) {
                        loadImage();
                    }
                }
            }
        }
    });

    onMount(() => {
        if (!priority) {
            observer = new IntersectionObserver(
                (entries) => {
                    entries.forEach((entry) => {
                        if (entry.isIntersecting && !loaded && !error) {
                            loadImage();
                        }
                    });
                },
                {
                    rootMargin: "200px",
                    threshold: 0.01,
                },
            );

            observer.observe(imgElement);

            return () => {
                if (observer) {
                    observer.disconnect();
                    observer = null;
                }
            };
        } else {
            loadImage();
        }
    });

    async function loadImage() {
        if (!src) {
            error = true;
            return;
        }

        const cleanUrl = cleanThumbnailUrl(src);
        const imageUrl = useProxy ? getProxyUrl(cleanUrl) : cleanUrl;

        await requestQueue.add(async () => {
            try {
                const img = new Image();

                const loadPromise = new Promise<void>((resolve, reject) => {
                    img.onload = () => {
                        loaded = true;
                        error = false;
                        if (imgElement) {
                            imgElement.style.backgroundImage = `url(${imageUrl})`;
                        }
                        resolve();
                    };

                    img.onerror = () => {
                        reject(new Error("Failed to load image"));
                    };
                });

                img.src = imageUrl;
                await loadPromise;
            } catch (err) {
                handleError();
            }
        }, priority);
    }

    function handleError() {
        if (!useProxy) {
            // First failure: try with proxy
            useProxy = true;
            loadImage();
        } else {
            // Proxy also failed: give up
            error = true;
        }
    }
</script>

<div
    bind:this={imgElement}
    class="{className} bg-slate-800 bg-cover transition-opacity duration-300"
    {style}
    class:opacity-0={!loaded && !error}
    class:opacity-100={loaded || error}
    role="img"
    aria-label={alt}
></div>
