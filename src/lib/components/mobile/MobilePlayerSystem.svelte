<script lang="ts">
    import { store } from "$lib/player";
    import Player from "../Player.svelte";
    import MobileDrawer from "../ui/MobileDrawer.svelte";
    import MobileLyrics from "./MobileLyrics.svelte";
    import MobilePlayer from "./MobilePlayer.svelte";
    import MobileQueue from "./MobileQueue.svelte";

    let showMobilePlayer = $state(false);

    // Handle mobile player state
    function handlePlayerClick() {
        if ($store.state !== "unstarted") {
            showMobilePlayer = true;
        }
    }

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
    <MobilePlayer bind:show={showMobilePlayer} />
</MobileDrawer>

<!-- Queue Drawer -->
<MobileDrawer open={$store.showQueue} onClose={closeQueue} title="Queue" maxHeight="max-h-[80vh]" zIndex={1100}>
    <MobileQueue />
</MobileDrawer>

<!-- Lyrics Drawer -->
<MobileDrawer open={$store.showLyrics} onClose={closeLyrics} title="Lyrics" maxHeight="max-h-[80vh]" zIndex={1200}>
    <MobileLyrics />
</MobileDrawer>

<!-- Mini Player (clickable to open mobile player) -->
<button class="w-full cursor-pointer rounded-lg bg-slate-900" disabled={$store.state === "unstarted"}>
    <Player onSongInfoClick={handlePlayerClick} />
</button>
