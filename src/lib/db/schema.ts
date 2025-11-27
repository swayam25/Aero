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

export const roomTable = pgTable("room", {
    id: uuid("id").defaultRandom().primaryKey(),
    name: text("name").notNull(),
    password: text("password").notNull().default(""),
    hostUserId: text("host_user_id")
        .notNull()
        .unique()
        .references(() => userTable.userId, { onDelete: "cascade" }),
    hostUserData: jsonb("host_user").$type<UserData>().notNull(),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    queue: jsonb("queue").$type<EnhancedSong[]>().notNull().default([]),
    isPublic: boolean("is_public").notNull().default(true),
});

export const roomMemberTable = pgTable("room_member", {
    roomId: uuid("room_id")
        .unique()
        .primaryKey()
        .references(() => roomTable.id, { onDelete: "cascade" }),
    userId: text("user_id")
        .notNull()
        .unique()
        .references(() => userTable.userId, { onDelete: "cascade" }),
    userData: jsonb("user").$type<UserData>().notNull(),
    joinedAt: timestamp("joined_at").notNull().defaultNow(),
});

// Playlist relations
export const playlistRelations = relations(playlistTable, ({ one }) => ({
    user: one(userTable, {
        fields: [playlistTable.userId],
        references: [userTable.userId],
    }),
}));

// RoomMember relations
export const roomMemberRelations = relations(roomMemberTable, ({ one }) => ({
    room: one(roomTable, { fields: [roomMemberTable.roomId], references: [roomTable.id] }),
    user: one(userTable, { fields: [roomMemberTable.userId], references: [userTable.userId] }),
}));

// Room relations
export const roomRelations = relations(roomTable, ({ one, many }) => ({
    host: one(userTable, {
        fields: [roomTable.hostUserId],
        references: [userTable.userId],
    }),
    members: many(roomMemberTable),
}));

// User relations for easy lookups
export const userRelations = relations(userTable, ({ many }) => ({
    playlists: many(playlistTable),
    hostedRooms: many(roomTable), // Rooms that the user is hosting (inverse of room.host)
    joinedRooms: many(roomMemberTable), // Rooms the user is a member of (via room_member join table)
}));

export type SelectUser = typeof userTable.$inferSelect;
export type InsertUser = typeof userTable.$inferInsert;

export type SelectPlaylist = typeof playlistTable.$inferSelect;
export type InsertPlaylist = typeof playlistTable.$inferInsert;

export type SelectRoom = typeof roomTable.$inferSelect;
export type InsertRoom = typeof roomTable.$inferInsert;

export type SelectRoomMember = typeof roomMemberTable.$inferSelect;
export type InsertRoomMember = typeof roomMemberTable.$inferInsert;
export type SelectRoomWithMembers = SelectRoom & { members: UserData[] };
