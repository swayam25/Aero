import type { SelectUser } from "$lib/db/schema";
import type { APIUser } from "discord-api-types/v10";

export type CookieUserData = APIUser & {
    url?: {
        avatar: string;
        avatarDecoration: string | null;
        banner: string | null;
    };
};

export type UserData = CookieUserData & {
    role: SelectUser["role"];
};
