import { deleteUser } from "$lib/db";
import type { RequestHandler } from "./$types";

export const POST: RequestHandler = async ({ cookies, locals }) => {
    if (locals.user) {
        await deleteUser(locals.db, locals.user?.id);
    } else {
        return new Response(JSON.stringify({ message: "User not logged in" }), {
            status: 401,
            headers: {
                "Content-Type": "application/json"
            }
        });
    }

    cookies.delete("access_token", { path: "/" });
    cookies.delete("refresh_token", { path: "/" });
    cookies.delete("user", { path: "/" });

    return new Response(JSON.stringify({ message: "Account Deleted" }), {
        status: 200,
        headers: {
            "Content-Type": "application/json"
        }
    });
};
