import { and, eq } from "drizzle-orm";
import type { PostgresJsDatabase } from "drizzle-orm/postgres-js";
import type postgres from "postgres";
import * as schema from "./schema";

export type DB = PostgresJsDatabase<typeof schema> & {
    $client: postgres.Sql<{}>;
};

export async function addUser(db: DB, id: string) {
    await db.insert(schema.userTable).values({ userID: id });
}

export async function deleteUser(db: DB, id: string) {
    await db.delete(schema.userTable).where(eq(schema.userTable.userID, id));
}

export async function checkUser(db: DB, id: string) {
    return db.query.userTable.findFirst({ where: eq(schema.userTable.userID, id) });
}

export async function fetchSettings(db: DB, key: string) {
    return db.query.settingsTable.findFirst({ where: eq(schema.settingsTable.key, key), columns: { value: true } });
}

export async function createPlaylist(db: DB, userID: string, name: string) {
    await db.insert(schema.playlistTable).values({ userID, name, songs: [] });
}

export async function renamePlaylist(db: DB, playlistID: string, name: string) {
    await db.update(schema.playlistTable).set({ name }).where(eq(schema.playlistTable.id, playlistID));
}

export async function deletePlaylist(db: DB, playlistID: string) {
    await db.delete(schema.playlistTable).where(eq(schema.playlistTable.id, playlistID));
}

export async function getPlaylists(db: DB, userID: string) {
    return db.query.playlistTable.findMany({ where: eq(schema.playlistTable.userID, userID) });
}

export async function getPublicPlaylists(db: DB, userID: string) {
    return db.query.playlistTable.findMany({ where: and(eq(schema.playlistTable.userID, userID), eq(schema.playlistTable.isPublic, true)) });
}

export async function checkPlaylist(db: DB, userID: string, playlistID: string) {
    return db.query.playlistTable.findFirst({
        where: (fields) => and(eq(fields.userID, userID), eq(fields.id, playlistID))
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
