import { getUser, ROLES, setUserRole } from "$lib/db/index.js";
import type { SelectUser } from "$lib/db/schema.js";
import { json } from "@sveltejs/kit";

export const POST = async ({ locals, request }) => {
    const user = locals.user;
    if (!user || !["owner", "dev"].includes(user.role)) {
        return json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();

    const id = body.id;
    if (!id) {
        return json({ error: "Missing id" }, { status: 400 });
    }
    const userData = await getUser(locals.db, id);
    if (!userData) {
        return json({ error: "User not found" }, { status: 404 });
    }

    const newRole = body.role as SelectUser["role"];
    if (!newRole || !ROLES.includes(newRole)) {
        return json({ error: "Invalid role" }, { status: 400 });
    }
    await setUserRole(locals.db, id, newRole);

    return json({ success: true });
};
