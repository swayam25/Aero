/**
 * Create a media query listener for mobile detection
 */
export function createMobileMediaQuery(callback: (isMobile: boolean) => void): () => void {
    if (typeof window === "undefined") return () => {};

    const mediaQuery = window.matchMedia("(max-width: 768px)");

    // Initial check
    callback(mediaQuery.matches);

    // Listen for changes
    const handler = (e: MediaQueryListEvent) => callback(e.matches);
    mediaQuery.addEventListener("change", handler);

    // Return cleanup function
    return () => mediaQuery.removeEventListener("change", handler);
}
