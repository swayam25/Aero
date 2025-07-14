import { relations } from "drizzle-orm";
import { boolean, jsonb, pgTable, serial, text, timestamp, uuid } from "drizzle-orm/pg-core";

export const userTable = pgTable("user", {
    id: serial("id").primaryKey(),
    userID: text("user_id").notNull().unique(),
    createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const playlistTable = pgTable("playlist", {
    id: uuid("id").defaultRandom().unique().primaryKey(),
    userID: text("user_id")
        .notNull()
        .references(() => userTable.userID, { onDelete: "cascade" }),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    name: text("name").notNull(),
    cover: text("cover"),
    songs: jsonb("songs").$type<string[]>().notNull(),
    isPublic: boolean("is_public").notNull().default(false),
});

export const userRelations = relations(userTable, ({ many }) => ({
    playlists: many(playlistTable),
}));

export const settingsTable = pgTable("settings", {
    key: text("key").primaryKey(),
    value: jsonb("value").$type<string[]>().notNull().default([]),
});

export type SelectPlaylist = typeof playlistTable.$inferSelect;
export type InsertPlaylist = typeof playlistTable.$inferInsert;

export type SelectSettings = typeof settingsTable.$inferSelect;
export type InsertSettings = typeof settingsTable.$inferInsert;
