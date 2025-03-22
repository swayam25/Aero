import { relations } from "drizzle-orm";
import { jsonb, pgTable, serial, text, timestamp } from "drizzle-orm/pg-core";

export const userTable = pgTable("user", {
    id: serial("id").primaryKey(),
    userID: text("user_id").notNull().unique(),
    createdAt: timestamp("created_at").notNull().defaultNow()
});

export const playlistTable = pgTable("playlist", {
    id: serial("id").primaryKey(),
    userID: text("user_id")
        .notNull()
        .references(() => userTable.userID, { onDelete: "cascade" }),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    name: text("name").notNull(),
    songs: jsonb("songs").$type<string[]>().notNull()
});

export const userRelations = relations(userTable, ({ many }) => ({
    playlists: many(playlistTable)
}));

export type SelectPlaylist = typeof playlistTable.$inferSelect;
export type InsertPlaylist = typeof playlistTable.$inferInsert;
