import type { NeonQueryFunction } from "@neondatabase/serverless";
import { eq } from "drizzle-orm";
import type { NeonHttpDatabase } from "drizzle-orm/neon-http";
import * as schema from "./schema";

type DB = NeonHttpDatabase<typeof schema> & {
    $client: NeonQueryFunction<false, false>;
};

export async function addUser(db: DB, id: string) {
    await db.insert(schema.userTable).values({ userID: id });
}

export async function deleteUser(db: DB, id: string) {
    await db.delete(schema.userTable).where(eq(schema.userTable.userID, id));
}

export async function checkUser(db: DB, id: string) {
    return await db.query.userTable.findFirst({ where: eq(schema.userTable.userID, id) });
}
