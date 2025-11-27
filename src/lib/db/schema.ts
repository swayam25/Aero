import type { UserData } from "$lib/discord/types";
import type { EnhancedSong } from "$lib/player/types";
import { relations } from "drizzle-orm";
import { boolean, jsonb, pgTable, serial, text, timestamp, uuid } from "drizzle-orm/pg-core";

export const userTable = pgTable("user", {
    id: serial("id").primaryKey(),
    userId: text("user_id").notNull().unique(),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    role: text("role").$type<"owner" | "dev" | "staff" | "user">().notNull().default("user"),
});

export const playlistTable = pgTable("playlist", {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: text("user_id")
        .notNull()
        .references(() => userTable.userId, { onDelete: "cascade" }),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    name: text("name").notNull(),
    cover: text("cover"),
    songs: jsonb("songs").$type<string[]>().notNull(),
    isPublic: boolean("is_public").notNull().default(false),
});

export const playlistRelations = relations(playlistTable, ({ one }) => ({
    user: one(userTable, {
        fields: [playlistTable.userId],
        references: [userTable.userId],
    }),
}));

export const roomTable = pgTable("room", {
    id: uuid("id").defaultRandom().primaryKey(),
    name: text("name").notNull(),
    password: text("password").notNull().default(""),
    hostUserId: text("host_user_id")
        .notNull()
        .references(() => userTable.userId, { onDelete: "cascade" }),
    host: jsonb("host").$type<UserData>().notNull(),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    members: jsonb("members").$type<UserData[]>().notNull().default([]),
    queue: jsonb("queue").$type<EnhancedSong[]>().notNull().default([]),
    isPublic: boolean("is_public").notNull().default(true),
});

export const roomRelations = relations(roomTable, ({ one }) => ({
    host: one(userTable, {
        fields: [roomTable.hostUserId],
        references: [userTable.userId],
    }),
}));

export type SelectUser = typeof userTable.$inferSelect;
export type InsertUser = typeof userTable.$inferInsert;

export type SelectPlaylist = typeof playlistTable.$inferSelect;
export type InsertPlaylist = typeof playlistTable.$inferInsert;

export type SelectRoom = typeof roomTable.$inferSelect;
export type InsertRoom = typeof roomTable.$inferInsert;
