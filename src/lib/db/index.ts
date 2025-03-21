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
    return db.query.userTable.findFirst({ where: eq(schema.userTable.userID, id) });
}

export async function createPlaylist(db: DB, userID: string, name: string) {
    await db.insert(schema.playlistTable).values({ userID, name, songs: [] });
}

export async function editPlaylist(db: DB, playlistID: number, name: string) {
    await db.update(schema.playlistTable).set({ name }).where(eq(schema.playlistTable.id, playlistID));
}

export async function deletePlaylist(db: DB, playlistID: number) {
    await db.delete(schema.playlistTable).where(eq(schema.playlistTable.id, playlistID));
}

export async function getPlaylists(db: DB, userID: string) {
    return db.query.playlistTable.findMany({ where: eq(schema.playlistTable.userID, userID) });
}

export async function addSongToPlaylist(db: DB, playlistID: number, songID: string) {
    const pl = await db.query.playlistTable.findFirst({ where: eq(schema.playlistTable.id, playlistID) });
    const newSongs = pl?.songs.filter((storedSongID) => storedSongID !== songID) || [];
    newSongs.push(songID);
    await db.update(schema.playlistTable).set({ songs: newSongs }).where(eq(schema.playlistTable.id, playlistID));
}

export async function removeSongFromPlaylist(db: DB, playlistID: number, songID: string) {
    const pl = await db.query.playlistTable.findFirst({ where: eq(schema.playlistTable.id, playlistID) });
    const newSongs = pl?.songs.filter((storedSongID) => storedSongID !== songID) || [];
    await db.update(schema.playlistTable).set({ songs: newSongs }).where(eq(schema.playlistTable.id, playlistID));
}
