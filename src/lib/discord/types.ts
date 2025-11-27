import type { SelectUser } from "$lib/db/schema";
import type { APIUser } from "discord-api-types/v10";

export type UserData = APIUser & {
    role: SelectUser["role"];
    url?: {
        avatar: string;
        avatarDecoration: string | null;
        banner: string | null;
    };
};
