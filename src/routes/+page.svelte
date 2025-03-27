<script lang="ts">
    import SongListX from "$lib/components/SongListX.svelte";
    import type { PageData } from "./$types";

    let { data }: { data: PageData } = $props();
</script>

<svelte:head>
    <title>Aero</title>
</svelte:head>

<div class="flex flex-col gap-4 md:gap-8">
    {#each Object.keys(data.songs) as categoryName}
        <div class="text-left">
            <h1 class="text-3xl font-bold md:text-4xl">{categoryName}</h1>
            {#await data.songs[categoryName as keyof typeof data.songs]}
                <SongListX skeleton />
            {:then songs}
                <SongListX user={data.user} {songs} />
            {/await}
        </div>
    {/each}
</div>
