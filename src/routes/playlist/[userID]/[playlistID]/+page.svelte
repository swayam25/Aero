<script lang="ts">
    import type { PageData } from "./$types";

    let { data }: { data: PageData } = $props();
</script>

<div class="flex w-full flex-col items-center justify-center gap-4 md:flex-row md:justify-start">
    <div class="size-40 rounded-lg bg-slate-800 md:size-50"></div>
    <div class="flex flex-col items-center justify-center gap-2 md:items-start">
        <h1 class="text-4xl font-bold md:text-8xl">{data.playlist.name}</h1>
        <p class="text-slate-400 md:text-lg">Created At {new Date(data.playlist.createdAt).toLocaleDateString()}</p>
    </div>
</div>
