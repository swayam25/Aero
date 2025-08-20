<div align="center">

![Aero](./assets/banner.png)

# Aero

Aero makes listening to music feel light and breezy

[![Svelte](https://img.shields.io/badge/dynamic/json?url=https%3A%2F%2Fraw.githubusercontent.com%2Fswayam25%2FAero%2Frefs%2Fheads%2Fmain%2Fpackage.json&query=%24.devDependencies%5B%22svelte%22%5D&style=for-the-badge&logo=svelte&logoColor=%23FFFFFF&label=Svelte&labelColor=%23FF3E00&color=%23000000)](https://svelte.dev/docs/svelte/overview)
[![Tailwind CSS](https://img.shields.io/badge/dynamic/json?url=https%3A%2F%2Fraw.githubusercontent.com%2Fswayam25%2FAero%2Frefs%2Fheads%2Fmain%2Fpackage.json&query=%24.devDependencies%5B%22tailwindcss%22%5D&style=for-the-badge&logo=tailwindcss&logoColor=%23FFFFFF&label=Tailwind%20CSS&labelColor=%2306B6D4&color=%23000000)](https://tailwindcss.com)
[![Supabase](https://img.shields.io/badge/dynamic/json?url=https%3A%2F%2Fraw.githubusercontent.com%2Fswayam25%2FAero%2Frefs%2Fheads%2Fmain%2Fpackage.json&query=%24.devDependencies%5B%22%40supabase%2Fsupabase-js%22%5D&style=for-the-badge&logo=supabase&logoColor=%23FFFFFF&label=Supabase&labelColor=%23198F57&color=%23000000)](https://supabase.com)
[![Drizzle ORM](https://img.shields.io/badge/dynamic/json?url=https%3A%2F%2Fraw.githubusercontent.com%2Fswayam25%2FAero%2Frefs%2Fheads%2Fmain%2Fpackage.json&query=%24.devDependencies%5B%22drizzle-orm%22%5D&style=for-the-badge&logo=drizzle&logoColor=%23000000&label=Drizzle%20ORM&labelColor=%23C5F74F&color=%23000000)](https://orm.drizzle.team)

</div>

## 🚩 Installation

1. Clone this repository
    ```sh
    git clone https://github.com/swayam25/Aero aero
    cd aero
    ```

2. Install dependencies
    ```sh
    pnpm i
    ```

3. Create an application at the [Discord Developer Portal](https://discord.com/developers/applications).
    ![New Application](./assets/new_app.png)

4. Create `.env` file from `.env.example` in the root directory and fill in the required values.
    <details>

    <summary>ENV Vars</summary>

    - Get `DATABASE_URL` from Supabase.
        ![Supabase DB URL](./assets/db_url.png)
    - Get `VITE_SUPABASE_URL` and `VITE_SUPABASE_KEY` from Supabase API Settings.
        ![Supabase API Info](./assets/api_info.png)
    - Get `JWT_SECRET` by running the following command.
        ```sh
        pnpm run gen-secret
        ```
    - Get `DISCORD_CLIENT_ID` and `DISCORD_CLIENT_SECRET` from the Discord Developer Portal.
        ![Client Info](./assets/client_info.png)
    - Get `DISCORD_BOT_TOKEN` from the Discord Developer Portal.
        ![Bot Token](./assets/bot_token.png)
    - Set `YOUTUBE_DL_PATH` to the path of `youtube-dl` or `yt-dlp` executable. You can install it from [GitHub Releases](https://github.com/yt-dlp/yt-dlp/releases) (`yt-dlp`) or use a package manager.
    - Set `DOMAIN` to your domain name or `https://localhost` for local development. The variable is required for production.
        ```env
        DOMAIN="https://your-domain.com"
        ```
    </details>

5. Add redirect url at the Discord Developer Portal.
    ![Discord Developer Portal](./assets/redirect_url.png)

6. Push the database schema to Supabase.
    ```sh
    pnpm run db:push
    ```

7. Navigate to **Table Editor** in Supabase Dashboard and enable **RLS** for all the tables.

8. Navigate to **Authentication** > **Policies** in Supabase Dashboard and create policies for all the tables.
    ![Policies](./assets/policies.png)

9.  Navigate to **Database** > **Publications** in Supabase Dashboard. Then click on `supabase_realtime` and enable the `playlist` table.
    ![Realtime Publication](./assets/realtime_publication.png)

10. Navigate to **Table Editor** in Supabase Dashboard and enable **Realtime** for `playlist` table.
    ![Playlist Realtime](./assets/playlist_realtime.png)

> [!NOTE]
> Check the [Supabase Docs](https://supabase.com/docs/guides/realtime/postgres-changes) for more information on enabling Realtime.

11. Start the app
    ```sh
    pnpm run dev
    ```

## 🚀 Production

1. Follow steps 1-10 from the [installation](#-installation) section.

2. Change `DOMAIN` in `.env` file to your domain name.
    ```env
    DOMAIN="https://your-domain.com"
    ```

> [!IMPORTANT]
> `DOMAIN` is the URL you will use to access the app.
> This dynamically sets `ORIGIN` during `node build` and configure the Caddy server's domain (*for the reverse proxy*).
> For local development, you can set it to `https://localhost`.
> Ensure this matches the Redirect URL in the Discord Developer Portal (*see step 5 in the [installation](#-installation) section*).
>
> Check the [SvelteKit Docs](https://svelte.dev/docs/kit/adapter-node#Environment-variables) for more information about the `ORIGIN` variable.

1. Run docker container (*via `docker compose`*)
    ```sh
    docker compose up -d
    ```

## ❤️ Contributing

- Things to keep in mind
    - Follow our commit message convention.
    - Write meaningful commit messages.
    - Keep the code clean and readable.
    - Make sure the app is working as expected.

- Code Formatting
    - Run `pnpm run format` before committing your changes or use [`Prettier`](https://prettier.io/) extension in your code editor.
    - Make sure to commit error free code. Run `pnpm run check` to check for any errors.

- CSS Style Guide (*Tailwind CSS*)
    ![CSS Style Guide](./assets/aero_ss.png)
    - Primary Font Color: `slate-50` (*No need to add this explicitly, it is already added as global font color in [app.css](./src/app.css)*)
    - Secondary Font Color: `slate-200`
    - Tertiary Font Color: `slate-400`
    - Theme Color: `sky-500`
    - Primary Background Color: `slate-950` (*Globally added in [app.css](./src/app.css)*)
    - Secondary Background Color: `slate-900` (*For cards/containers*)
    - Tertiary Background Color: `slate-800` (*For cards/options on hover*)
    - Card/Container Background Color: `slate-900` (*For cards add `border-slate-700`*)
    - For other colors use `<color>-500` as text color and `<color>-500/10` as background color on hover (*make sure to have bg color as `slate-800`/`slate-900`/`slate-950` before hover*).
    - Border radius: `rounded-lg` (*For every possible card/container*)
    - For buttons and links, we strictly use the [`<Button />`](./src/lib/components/ui/Button.svelte) component.

- Z Index Layer System
    - **Base Layer (`z-0`)**: Layout components and default content.
    - **Content Layer (`z-10`)**: Drawer content and elevated cards.
    - **UI Components (`z-50`)**: Tooltips and popovers.
    - **Modals & Overlays (`z-100`)**: Dialog and alert popups.
    - **Toast Notifications (`z-2000`)**: Toast messages using `style="z-index: 2000;"`.
    - **Context Menus (`z-[1000]`)**: Right-click context menu using `z-[1000]` class.
    - **Submenus (`z-[1001]`)**: Context menu submenus using `z-[1001]` class.
    - **Mobile Drawers**: Dynamic `zIndex` prop values:
        - Player drawer: `zIndex={1000}` (*default `MobileDrawer` component `zIndex` value*)
        - Queue & Lyrics drawer: `zIndex={1100}`
        - Context menu drawer: `zIndex={1300}`
