import type { UserData } from "$lib/discord/types";
import * as schema from "$lib/server/schema";
import type { NeonQueryFunction } from "@neondatabase/serverless";
import type { NeonHttpDatabase } from "drizzle-orm/neon-http";
import "unplugin-icons/types/svelte";
import type YTMusic from "ytmusic-api";

declare global {
    namespace App {
        // interface Error {}
        interface Locals {
            db: NeonHttpDatabase<typeof schema> & {
                $client: NeonQueryFunction<false, false>;
            };
            user: UserData | null;
            ytmusic: YTMusic;
        }
        // interface PageData {}
        // interface PageState {}
        // interface Platform {}
    }
}

export {};
