import type { UserData } from "$lib/discord/types";
import type { EnhancedSong } from "$lib/player/types";
import { and, eq } from "drizzle-orm";
import type { PostgresJsDatabase } from "drizzle-orm/postgres-js";
import type postgres from "postgres";
import * as schema from "./schema";

export type DB = PostgresJsDatabase<typeof schema> & {
    $client: postgres.Sql<{}>;
};

export async function addUser(db: DB, id: string) {
    await db.insert(schema.userTable).values({ userId: id });
}

export async function deleteUser(db: DB, id: string) {
    await db.delete(schema.userTable).where(eq(schema.userTable.userId, id));
}

export async function checkUser(db: DB, id: string) {
    return db.query.userTable.findFirst({ where: eq(schema.userTable.userId, id) });
}

export async function createPlaylist(db: DB, userId: string, name: string): Promise<schema.InsertPlaylist> {
    const [pl] = await db.insert(schema.playlistTable).values({ userId, name, songs: [] }).returning();
    return pl;
}

export async function renamePlaylist(db: DB, playlistID: string, name: string) {
    await db.update(schema.playlistTable).set({ name }).where(eq(schema.playlistTable.id, playlistID));
}

export async function deletePlaylist(db: DB, playlistID: string) {
    await db.delete(schema.playlistTable).where(eq(schema.playlistTable.id, playlistID));
}

export async function getPlaylists(db: DB, userId: string) {
    return db.query.playlistTable.findMany({ where: eq(schema.playlistTable.userId, userId) });
}

export async function getPublicPlaylists(db: DB, userId: string) {
    return db.query.playlistTable.findMany({ where: and(eq(schema.playlistTable.userId, userId), eq(schema.playlistTable.isPublic, true)) });
}

export async function checkPlaylist(db: DB, userId: string, playlistID: string) {
    return db.query.playlistTable.findFirst({
        where: (fields) => and(eq(fields.userId, userId), eq(fields.id, playlistID)),
    });
}

export async function addSongToPlaylist(db: DB, playlistID: string, songID: string) {
    const pl = await db.query.playlistTable.findFirst({ where: eq(schema.playlistTable.id, playlistID) });
    const newSongs = pl?.songs.filter((storedSongID) => storedSongID !== songID) || [];
    newSongs.push(songID);
    await db.update(schema.playlistTable).set({ songs: newSongs }).where(eq(schema.playlistTable.id, playlistID));
}

export async function removeSongFromPlaylist(db: DB, playlistID: string, songID: string) {
    const pl = await db.query.playlistTable.findFirst({ where: eq(schema.playlistTable.id, playlistID) });
    const newSongs = pl?.songs.filter((storedSongID) => storedSongID !== songID) || [];
    await db.update(schema.playlistTable).set({ songs: newSongs }).where(eq(schema.playlistTable.id, playlistID));
}

export async function setPlaylistCover(db: DB, playlistID: string, cover: string) {
    await db.update(schema.playlistTable).set({ cover }).where(eq(schema.playlistTable.id, playlistID));
}

export async function toggleView(db: DB, playlistID: string) {
    const pl = await db.query.playlistTable.findFirst({ where: eq(schema.playlistTable.id, playlistID) });
    await db.update(schema.playlistTable).set({ isPublic: !pl!.isPublic }).where(eq(schema.playlistTable.id, playlistID));
    return !pl!.isPublic;
}

export async function reorderPlaylist(db: DB, playlistID: string, songs: string[]) {
    await db.update(schema.playlistTable).set({ songs }).where(eq(schema.playlistTable.id, playlistID));
}

export async function getRooms(db: DB) {
    return db.query.roomTable.findMany();
}

export async function getRoom(db: DB, id: string) {
    return db.query.roomTable.findFirst({ where: eq(schema.roomTable.id, id) });
}

export async function createRoom(db: DB, name: string, password: string, hostUser: UserData, isPublic: boolean = true) {
    const [room] = await db.insert(schema.roomTable).values({ name, password, hostUserId: hostUser.id, host: hostUser, isPublic }).returning();
    return room;
}

export async function addRoomMember(db: DB, roomID: string, user: UserData) {
    const room = await db.query.roomTable.findFirst({ where: eq(schema.roomTable.id, roomID) });
    const members = (room?.members || []).filter((m) => m.id !== user.id);
    members.push(user);
    await db.update(schema.roomTable).set({ members }).where(eq(schema.roomTable.id, roomID));
}

export async function removeRoomMember(db: DB, roomID: string, user: UserData) {
    const room = await db.query.roomTable.findFirst({ where: eq(schema.roomTable.id, roomID) });
    const members = (room?.members || []).filter((m) => m.id !== user.id);
    await db.update(schema.roomTable).set({ members }).where(eq(schema.roomTable.id, roomID));
}

export async function addSongToQueue(db: DB, roomID: string, song: EnhancedSong) {
    const room = await db.query.roomTable.findFirst({ where: eq(schema.roomTable.id, roomID) });
    const queue = (room?.queue || []).filter((s) => s.videoId !== (song as any).videoId);
    queue.push(song as any);
    const [r] = await db.update(schema.roomTable).set({ queue }).where(eq(schema.roomTable.id, roomID)).returning();
    return r;
}

export async function removeSongFromQueue(db: DB, roomID: string, songID: string) {
    const room = await db.query.roomTable.findFirst({ where: eq(schema.roomTable.id, roomID) });
    const queue = (room?.queue || []).filter((s) => s.videoId !== songID);
    await db.update(schema.roomTable).set({ queue }).where(eq(schema.roomTable.id, roomID));
}

export async function toggleRoomVisibility(db: DB, roomID: string) {
    const room = await db.query.roomTable.findFirst({ where: eq(schema.roomTable.id, roomID) });
    await db.update(schema.roomTable).set({ isPublic: !room!.isPublic }).where(eq(schema.roomTable.id, roomID));
    return !room!.isPublic;
}

export async function reorderQueue(db: DB, roomID: string, videoIds: string[]) {
    const room = await db.query.roomTable.findFirst({ where: eq(schema.roomTable.id, roomID) });
    const existing = room?.queue || [];
    const reordered = videoIds.map((id) => existing.find((s) => s.videoId === id)).filter(Boolean);
    await db
        .update(schema.roomTable)
        .set({ queue: reordered as any })
        .where(eq(schema.roomTable.id, roomID));
}

export async function renameRoom(db: DB, roomID: string, name: string) {
    await db.update(schema.roomTable).set({ name }).where(eq(schema.roomTable.id, roomID));
}

export async function deleteRoom(db: DB, roomID: string) {
    await db.delete(schema.roomTable).where(eq(schema.roomTable.id, roomID));
}
