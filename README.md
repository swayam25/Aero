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

## 💫 Prerequisites

### 🧰 Tools

| Tool                                                                                                                                    | Type                     | Version | Purpose                                                |
| --------------------------------------------------------------------------------------------------------------------------------------- | ------------------------ | ------- | ------------------------------------------------------ |
| [![Docker](https://img.shields.io/badge/Docker-%232560FF?style=for-the-badge&logo=docker&logoColor=%23FFFFFF)](https://www.docker.com/) | Required                 | 20.10+  | To deploy the app using containerization.              |
| [![Git](https://img.shields.io/badge/Git-%23F05133?style=for-the-badge&logo=git&logoColor=%23FFFFFF)](https://git-scm.com/)             | Required                 | 2.50+   | To clone the repository and manage version control.    |
| [![Node.js](https://img.shields.io/badge/Node.js-%235FA04E?style=for-the-badge&logo=node.js&logoColor=%23FFFFFF)](https://nodejs.org/)  | Optional (*Development*) | 24+     | To run the app locally and contribute to the codebase. |
| [![Pnpm](https://img.shields.io/badge/Pnpm-%23F69220?style=for-the-badge&logo=pnpm&logoColor=%23FFFFFF)](https://pnpm.io/)              | Optional (*Development*) | 10.20+  | To manage project dependencies efficiently.            |

### 🧲 VPS Specs

| Component | Minimum Requirement | Recommended Requirement |
| --------- | ------------------- | ----------------------- |
| CPU       | 2 vCPU              | 4 vCPU or more          |
| RAM       | 4 GB                | 8 GB or more            |
| Storage   | 10 GB               | 20 GB                   |
| Network   | 100 Mbps            | 1 Gbps or more          |

## 🚀 Production

1. Clone the repository

   ```sh
   git clone https://github.com/swayam25/Aero aero
   cd aero
   ```

2. Create an application at the [Discord Developer Portal](https://discord.com/developers/applications).
    ![New Application](./assets/new_app.png)

3. Create `.env` file from the provided `.env.example` and fill in the required environment variables.
    ```sh
    cp .env.example .env
    ```
> [!TIP]
> Check [environment variables](#-environment-variables) section for details on the environment variables.

4. Add redirect url at the Discord Developer Portal.
    ![Discord Developer Portal](./assets/redirect_url.png)

5. Push the database schema to Supabase.
    ```sh
    pnpm run db:push
    ```

6. Navigate to **Table Editor** in Supabase Dashboard and enable **RLS** for all the tables.

7. Navigate to **Authentication** > **Policies** in Supabase Dashboard and create policies for all the tables.
    ![Policies](./assets/policies.png)

8. Navigate to **Table Editor** in Supabase Dashboard and enable **Realtime** for `playlist`, `room` & `room_member` table.
    ![Playlist Realtime](./assets/realtime.png)

> [!NOTE]
> Check the [Supabase Docs](https://supabase.com/docs/guides/realtime/postgres-changes) for more information on enabling Realtime.

9. Docker compose
   ```sh
   docker compose up -d
   ```

## 🛸 Development

1. Follow first 8 steps from the [production](#-production) section.

2. Install dependencies
   ```sh
   pnpm i
   ```

3. Start the development server
   ```sh
   pnpm run dev
   ```

## 🔑 Environment Variables

| Variable                | Type     | Description                                              |
| ----------------------- | -------- | -------------------------------------------------------- |
| `PUBLIC_DISCORD_URL`    | `string` | Discord API base URI                                     |
| `DATABASE_URL`          | `string` | Supabase connection string                               |
| `VITE_SUPABASE_URL`     | `string` | Supabase project URL                                     |
| `VITE_SUPABASE_KEY`     | `string` | Supabase API Key                                         |
| `JWT_SECRET`            | `string` | JWT secret                                               |
| `DISCORD_CLIENT_ID`     | `string` | Discord client ID                                        |
| `DISCORD_CLIENT_SECRET` | `string` | Discord client secret                                    |
| `DISCORD_BOT_TOKEN`     | `string` | Discord bot token                                        |
| `SPOTIFY_CLIENT_ID`     | `string` | Spotify client ID                                        |
| `SPOTIFY_CLIENT_SECRET` | `string` | Spotify client secret                                    |
| `YOUTUBE_DL_PATH`       | `string` | Path to `youtube-dl`/`yt-dlp` binary                     |
| `DOMAIN`                | `string` | Your domain for the reverse proxy, also used as `ORIGIN` |

### 📚 Getting database keys

- Create a supabase project
    ![Supabase New Project](./assets/supabase_project.png)

- Get `DATABASE_URL` from Supabase. Click on the <img src="./assets/connect_btn.png" alt="Connect Button" width="80" /> button at the top bar.
    ![Supabase DB URL](./assets/db_url.png)

- Get `VITE_SUPABASE_URL` and `VITE_SUPABASE_KEY` from Supabase API Settings.
    | `VITE_SUPABASE_URL`                  | `VITE_SUPABASE_KEY`                                       |
    | ------------------------------------ | --------------------------------------------------------- |
    | ![Supabase API](./assets/db_api.png) | ![Supabase Publishable Key](./assets/publishable_key.png) |

### 🔮 Getting Discord OAuth keys

- Get `DISCORD_CLIENT_ID` and `DISCORD_CLIENT_SECRET` from the Discord Developer Portal.
        ![Client Info](./assets/client_info.png)

- Get `DISCORD_BOT_TOKEN` from the Discord Developer Portal.
    ![Bot Token](./assets/bot_token.png)

### 🎷 Getting Spotify API keys

- Get `SPOTIFY_CLIENT_ID` and `SPOTIFY_CLIENT_SECRET` from the [Spotify Developer Dashboard](https://developer.spotify.com/dashboard/applications).
    - Create a new application and fill in the required details.
    - Set Redirect URI to `http://localhost` (*we don't need it, but Spotify requires it to be set*).
    - Select the API scopes required for the app.
        ![Spotify App](./assets/spotify_scopes.png)
    - Copy the Client ID and Client Secret.
        ![Spotify Client Info](./assets/spotify_client_info.png)

### 🪇 Other keys

- Generate `JWT_SECRET` by running the following command.
    ```sh
    pnpm run gen-secret
    ```

### 🌏 Setting domain

- Set `DOMAIN` to your domain name. *The variable is required only in production.*
    ```env
    DOMAIN="https://<your-domain>.com"
    ```

> [!IMPORTANT]
> `DOMAIN` is the URL you will use to access the app.
> This dynamically sets `ORIGIN` during deployment and configures the Caddy server's domain (*for the reverse proxy*).
> ![Redirect URl for Production](./assets/redirect_url_prod.png)
> Ensure that the domain name matches the Redirect URL in the Discord Developer Portal (*see step 4 of the [production](#-production) section*).
>
> Check the [SvelteKit Docs](https://svelte.dev/docs/kit/adapter-node#Environment-variables) for more information about the `ORIGIN` variable.

## ❤️ Contributing

- Things to keep in mind
    - Follow our commit message convention.
    - Write meaningful commit messages.
    - Keep the code clean and readable.
    - Make sure the app is working as expected.

- Code Formatting
    - Run `pnpm run format` before committing your changes or use [`Prettier`](https://prettier.io/) extension in your code editor.
    - Make sure to commit error free code. Run `pnpm run check` to check for any errors.

- Check [STYLES.md](./STYLES.md) for the CSS style guide.