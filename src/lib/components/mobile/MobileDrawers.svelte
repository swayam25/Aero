<script lang="ts">
    import type { UserData } from "$lib/discord/types";
    import { store } from "$lib/player";
    import MobileDrawer from "../ui/MobileDrawer.svelte";
    import MobileLyrics from "./MobileLyrics.svelte";
    import MobilePlayer from "./MobilePlayer.svelte";
    import MobileQueue from "./MobileQueue.svelte";

    let { user, showMobilePlayer = $bindable(false) }: { user: UserData | null; showMobilePlayer: boolean } = $props();

    function closeMobilePlayer() {
        showMobilePlayer = false;
    }

    // Handle queue/lyrics state
    function closeQueue() {
        $store.showQueue = false;
    }

    function closeLyrics() {
        $store.showLyrics = false;
    }
</script>

<!-- Mobile Player Drawer (Full Screen) -->
<MobileDrawer
    title="Now Playing"
    open={showMobilePlayer}
    onClose={closeMobilePlayer}
    fullScreen={true}
    backgroundImage={$store.meta?.thumbnails[0].url.replace("=w60-h60-l90-rj", "") || ""}
    blur={true}
>
    <MobilePlayer {user} bind:show={showMobilePlayer} />
</MobileDrawer>

<!-- Queue Drawer -->
<MobileDrawer open={$store.showQueue} dismissible={false} onClose={closeQueue} title="Queue" maxHeight="max-h-[80vh]" zIndex={801}>
    <MobileQueue />
</MobileDrawer>

<!-- Lyrics Drawer -->
<MobileDrawer open={$store.showLyrics} onClose={closeLyrics} title="Lyrics" maxHeight="max-h-[80vh]" zIndex={802}>
    <MobileLyrics />
</MobileDrawer>
