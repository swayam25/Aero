<script lang="ts">
    import Badge from "$lib/components/ui/Badge.svelte";
    import Seo from "$lib/components/ui/Seo.svelte";
    import { expoOut } from "svelte/easing";
    import { fly } from "svelte/transition";
    import type { PageData } from "./$types";

    let { data }: { data: PageData } = $props();
</script>

<Seo
    title={`${data.user?.global_name || data.user?.username}'s Profile`}
    image={data.user?.avatar ? `${data.user.url?.avatar}?size=4096` : undefined}
/>

<div class="flex flex-col items-center justify-start">
    <div class="w-full">
        {#if data.user?.url?.banner}
            <img src="{data.user.url.banner}?size=4096" alt="User Banner" class="h-20 w-full rounded-lg object-cover md:h-30 lg:h-40" />
        {:else}
            <div
                class="h-20 w-full rounded-lg md:h-30 lg:h-40"
                style="background-color: {data.user?.accent_color ? `#${data.user?.accent_color.toString(16).padStart(6, '0')}` : '#1F2937'};"
            ></div>
        {/if}
    </div>
    <div class="-mt-12 ml-10 flex w-full items-center justify-start gap-4">
        <div class="relative flex size-25 shrink-0 items-center justify-center md:size-30">
            <img
                src={data.user?.url?.avatar}
                alt="User Avatar"
                class="rounded-full border-8 border-slate-950 bg-slate-950 md:border-slate-900 md:bg-slate-900"
            />
            {#if data.user?.url?.avatarDecoration}
                <img src={data.user.url.avatarDecoration} alt="Avatar Decoration" class="absolute rounded-full" />
            {/if}
        </div>
        <div class="mt-14 flex flex-col items-start justify-center">
            <div class="flex items-center justify-center gap-1">
                <p class="text-3xl font-bold md:text-4xl">{data.user?.global_name || data.user?.username}</p>
                <Badge role={data.user?.role} />
            </div>
            <p class="font-mono text-sm text-slate-400">{data.user?.id}</p>
        </div>
    </div>
</div>

{#if data.playlists.length > 0}
    <h1 class="mt-10 text-3xl font-bold md:text-4xl">Public Playlists</h1>

    <div class="flex flex-wrap items-center justify-start gap-2 py-2 md:py-5">
        {#each data.playlists as playlist}
            <a
                in:fly={{ duration: 500, easing: expoOut, x: -100, y: 0 }}
                out:fly={{ duration: 500, easing: expoOut, x: 100, y: 0 }}
                href={`/playlist/${data.user?.id}/${playlist.id}`}
                class="group flex size-fit cursor-pointer flex-col items-start justify-center gap-2 rounded-lg p-3 transition-colors duration-200 hover:bg-slate-800"
            >
                <div
                    class="size-40 shrink-0 rounded-lg bg-slate-800 bg-cover transition-colors duration-200 group-hover:bg-slate-900 md:size-50"
                    style="background-image: url({playlist.cover});"
                ></div>
                <div class="text-left">
                    <p class="text-sm">{playlist.name}</p>
                </div>
            </a>
        {/each}
    </div>
{/if}
