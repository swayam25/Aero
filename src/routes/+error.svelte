<script lang="ts">
    import { page } from "$app/state";
</script>

<svelte:head>
    <title>Aero | {page.error?.message}</title>
</svelte:head>

<div class="flex size-full flex-col items-center justify-center gap-1">
    <h1 class="text-4xl font-extrabold md:text-5xl">{page.status}</h1>
    <h2 class="text-xl font-semibold text-slate-400 md:text-2xl">{page.error?.message}</h2>
</div>
