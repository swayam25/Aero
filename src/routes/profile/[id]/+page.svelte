<script lang="ts">
    import type { PageData } from "./$types";

    let { data }: { data: PageData } = $props();
</script>

<svelte:head>
    <title>Aero | {data.user.global_name || data.user.username}'s Profile</title>
</svelte:head>

<div class="flex w-full flex-col items-center justify-start">
    <div class="w-full">
        {#if data.user.banner}
            <img
                src={`https://cdn.discordapp.com/banners/${data.user.id}/${data.user.banner}?size=4096`}
                alt="User Banner"
                class="h-20 w-full rounded-t-lg object-cover md:h-30 lg:h-40"
            />
        {:else}
            <div
                class="h-20 w-full rounded-t-lg md:h-30 lg:h-40"
                style="background-color: {data.user.accent_color ? `#${data.user.accent_color.toString(16).padStart(6, '0')}` : '#1F2937'};"
            ></div>
        {/if}
    </div>
    <div class="-mt-12 ml-10 flex w-full items-center justify-start gap-4">
        <img
            src={`https://cdn.discordapp.com/avatars/${data.user.id}/${data.user.avatar}?size=4096`}
            alt="User Avatar"
            class="size-25 rounded-full border-8 border-slate-950 bg-slate-950 md:size-30 md:border-slate-900 md:bg-slate-900"
        />
        {#if data.user.avatar_decoration_data?.asset}
            <img
                src={`https://cdn.discordapp.com/avatar-decoration-presets/${data.user.avatar_decoration_data?.asset}`}
                alt="Avatar Decoration"
                class="absolute z-10 size-25 rounded-full md:size-30"
            />
        {/if}
        <div class="mt-14 flex flex-col items-start justify-center">
            <p class="text-3xl font-bold md:text-4xl">{data.user.global_name || data.user.username}</p>
            <p class="font-mono text-sm text-slate-400">{data.user.id}</p>
        </div>
    </div>
</div>
