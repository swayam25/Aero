import type { RequestHandler } from "./$types";

export const GET: RequestHandler = async ({ cookies }) => {
    cookies.delete("access_token", { path: "/" });
    cookies.delete("refresh_token", { path: "/" });
    cookies.delete("user", { path: "/" });

    return new Response(JSON.stringify({ message: "Logged out" }), {
        status: 200,
        headers: {
            "Content-Type": "application/json",
        },
    });
};
