import type { DB } from "$lib/db";
import type { UserData } from "$lib/discord/types";
import "unplugin-icons/types/svelte";
import type YTMusic from "ytmusic-api";

declare global {
    namespace App {
        // interface Error {}
        interface Locals {
            db: DB;
            user: UserData | null;
            ytmusic: YTMusic;
        }
        // interface PageData {}
        // interface PageState {}
        // interface Platform {}
    }
}

export {};
