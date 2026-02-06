<div align="center">

![Aero](./assets/banner.png)

# Aero

Aero makes listening to music feel light and breezy

[![Svelte](https://img.shields.io/badge/dynamic/json?url=https%3A%2F%2Fraw.githubusercontent.com%2Fswayam25%2FAero%2Frefs%2Fheads%2Fmain%2Fpackage.json&query=%24.devDependencies%5B%22svelte%22%5D&style=for-the-badge&logo=svelte&logoColor=%23FFFFFF&label=Svelte&labelColor=%23FF3E00&color=%23000000)](https://svelte.dev/docs/svelte/overview)
[![Tailwind CSS](https://img.shields.io/badge/dynamic/json?url=https%3A%2F%2Fraw.githubusercontent.com%2Fswayam25%2FAero%2Frefs%2Fheads%2Fmain%2Fpackage.json&query=%24.devDependencies%5B%22tailwindcss%22%5D&style=for-the-badge&logo=tailwindcss&logoColor=%23FFFFFF&label=Tailwind%20CSS&labelColor=%2306B6D4&color=%23000000)](https://tailwindcss.com)
[![Supabase](https://img.shields.io/badge/dynamic/json?url=https%3A%2F%2Fraw.githubusercontent.com%2Fswayam25%2FAero%2Frefs%2Fheads%2Fmain%2Fpackage.json&query=%24.dependencies%5B%22%40supabase%2Fsupabase-js%22%5D&style=for-the-badge&logo=supabase&logoColor=%23FFFFFF&label=Supabase&labelColor=%23198F57&color=%23000000)](https://supabase.com)
[![Drizzle ORM](https://img.shields.io/badge/dynamic/json?url=https%3A%2F%2Fraw.githubusercontent.com%2Fswayam25%2FAero%2Frefs%2Fheads%2Fmain%2Fpackage.json&query=%24.dependencies%5B%22drizzle-orm%22%5D&style=for-the-badge&logo=drizzle&logoColor=%23000000&label=Drizzle%20ORM&labelColor=%23C5F74F&color=%23000000)](https://orm.drizzle.team)

</div>

## 📸 Preview

<details>

<summary>Desktop</summary>

![Desktop Preview](./assets/preview/desktop.png)

</details>

<details>

<summary>Mobile</summary>

| Mobile Homepage                                      | Mobile Player                                        |
| ---------------------------------------------------- | ---------------------------------------------------- |
| ![Mobile Homepage](./assets/preview/mobile_home.png) | ![Mobile Player](./assets/preview/mobile_player.png) |

</details>

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

    - Get `DATABASE_URL` from Supabase. Click on the <img src="./assets/connect_btn.png" alt="Connect Button" width="50" /> button at the top bar.
        ![Supabase DB URL](./assets/db_url.png)
    - Get `VITE_SUPABASE_URL` and `VITE_SUPABASE_KEY` from Supabase API Settings.
        ![Supabase API](./assets/db_api.png)
        ![Supabase Publishable Key](./assets/publishable_key.png)
    - Get `JWT_SECRET` by running the following command.
        ```sh
        pnpm run gen-secret
        ```
    - Get `DISCORD_CLIENT_ID` and `DISCORD_CLIENT_SECRET` from the Discord Developer Portal.
        ![Client Info](./assets/client_info.png)
    - Get `DISCORD_BOT_TOKEN` from the Discord Developer Portal.
        ![Bot Token](./assets/bot_token.png)
    - Get `SPOTIFY_CLIENT_ID` and `SPOTIFY_CLIENT_SECRET` from the [Spotify Developer Dashboard](https://developer.spotify.com/dashboard/applications).
        - Create a new application and fill in the required details.
        - Set Redirect URI to `http://localhost` (*we don't need it, but Spotify requires it to be set*).
        - Select the API scopes required for the app.
            ![Spotify App](./assets/spotify_scopes.png)
        - Copy the Client ID and Client Secret.
            ![Spotify Client Info](./assets/spotify_client_info.png)
    - Set `YOUTUBE_DL_PATH` to the path of `youtube-dl` or `yt-dlp` executable. You can install it from [GitHub Releases](https://github.com/yt-dlp/yt-dlp/releases) (`yt-dlp`) or use a package manager.
    - Set `DOMAIN` to your domain name or `http://localhost:3000` for local development. The variable is required for production.
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

9. Navigate to **Table Editor** in Supabase Dashboard and enable **Realtime** for `playlist`, `room` & `room_member` table.
    ![Playlist Realtime](./assets/realtime.png)

> [!NOTE]
> Check the [Supabase Docs](https://supabase.com/docs/guides/realtime/postgres-changes) for more information on enabling Realtime.

10. Start the app
    ```sh
    pnpm run dev
    ```

## 🚀 Production

1. Follow steps 1-9 from the [installation](#-installation) section.

2. Change `DOMAIN` in `.env` file to your domain name.
    ```env
    DOMAIN="https://your-domain.com"
    ```

> [!IMPORTANT]
> `DOMAIN` is the URL you will use to access the app.
> This dynamically sets `ORIGIN` during `node build` and configure the Caddy server's domain (*for the reverse proxy*).
> For local development, you can set it to `http://localhost:3000`.
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

- Check [STYLES.MD](./STYLES.MD) for the CSS style guide.
