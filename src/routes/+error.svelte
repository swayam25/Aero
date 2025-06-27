<script lang="ts">
    import { page } from "$app/state";
    import Seo from "$lib/components/ui/Seo.svelte";
</script>

<Seo title={page.error?.message} />

<div class="flex size-full flex-col items-center justify-center gap-1">
    <h1 class="text-4xl font-extrabold md:text-5xl">{page.status}</h1>
    <h2 class="text-xl font-semibold text-slate-400 md:text-2xl">{page.error?.message}</h2>
</div>
