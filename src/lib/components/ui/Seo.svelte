<script lang="ts">
    interface Props {
        title?: string;
        description?: string;
        image?: string;
        author?: string;
    }
    let {
        title = "",
        description = "Aero makes listening to music feel light and breezy.",
        image = "/aero.webp",
        author = "Swayam"
    }: Props = $props();
</script>

<svelte:head>
    <title>Aero {title ? `| ${title}` : ""}</title>
    <link rel="icon" href="/aero.webp" />
    <meta name="description" content={description} />
    <meta name="theme-color" content="#0EA5E9" />
    <meta name="background-color" content="#020617" />
    <meta name="author" content={author} />

    <!-- Open Graph / Facebook -->
    <meta property="og:type" content="website" />
    <meta property="og:title" content="Aero {title ? `| ${title}` : ''}" />
    <meta property="og:description" content={description} />
    <meta property="og:image" content={image} />

    <!-- Twitter -->
    <meta property="twitter:card" content="summary_large_image" />
    <meta property="twitter:title" content="Aero {title ? `| ${title}` : ''}" />
    <meta property="twitter:description" content={description} />
    <meta property="twitter:image" content={image} />
</svelte:head>
