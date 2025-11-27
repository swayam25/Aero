<script lang="ts">
    import JoinRoomPopup from "$lib/components/JoinRoomPopup.svelte";
    import RoomActionPopups from "$lib/components/RoomActionPopups.svelte";
    import type { Snippet } from "svelte";
    import type { PageData } from "./$types";

    interface Props {
        data: PageData;
        children: Snippet;
    }

    let { data, children }: Props = $props();
</script>

<JoinRoomPopup />
<RoomActionPopups />

{@render children()}
