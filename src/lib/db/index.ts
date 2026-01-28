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

export async function getUser(db: DB, id: string) {
    return db.query.userTable.findFirst({ where: eq(schema.userTable.userId, id) });
}

export const ROLES: schema.SelectUser["role"][] = ["owner", "dev", "staff", "user"];

export async function setUserRole(db: DB, id: string, role: schema.SelectUser["role"]) {
    await db.update(schema.userTable).set({ role }).where(eq(schema.userTable.userId, id)).returning();
}

export async function getUserRoom(db: DB, id: string): Promise<schema.SelectRoomSafe | null> {
    const user = await db.query.userTable.findFirst({
        where: eq(schema.userTable.userId, id),
        with: {
            hostedRooms: true,
            joinedRooms: true,
        },
    });

    const roomId = user?.hostedRooms?.[0]?.id ?? user?.joinedRooms?.[0]?.roomId;
    if (!roomId) return null;

    return await getRoom(db, roomId, false, true);
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
    return db.query.playlistTable.findMany({
        where: eq(schema.playlistTable.userId, userId),
        orderBy(fields, operators) {
            return operators.asc(fields.name);
        },
    });
}

export async function getPublicPlaylists(db: DB, userId: string) {
    return db.query.playlistTable.findMany({ where: and(eq(schema.playlistTable.userId, userId), eq(schema.playlistTable.isPublic, true)) });
}

export async function getPlaylist(db: DB, userId: string, playlistID: string) {
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

export async function getRooms(db: DB): Promise<schema.SelectRoomWithMembersSafe[]> {
    const rooms = await db.query.roomTable.findMany();

    // Attach members from room_member table for compatibility with UI
    const roomsWithMembers = await Promise.all(
        rooms.map(async (room) => {
            const members = await db.query.roomMemberTable.findMany({ where: eq(schema.roomMemberTable.roomId, room.id) });
            const { password, ...safeRoom } = room;
            return { ...safeRoom, hasPassword: !!password, members: members.map((m) => m.userData) };
        }),
    );
    return roomsWithMembers;
}

export function getRoom(db: DB, id: string): Promise<schema.SelectRoomWithMembersSafe | null>;
export function getRoom(db: DB, id: string, withMembers: true, safe?: true): Promise<schema.SelectRoomWithMembersSafe | null>;
export function getRoom(db: DB, id: string, withMembers: false, safe?: true): Promise<schema.SelectRoomSafe | null>;
export function getRoom(db: DB, id: string, withMembers: true, safe: false): Promise<schema.SelectRoomWithMembers | null>;
export function getRoom(db: DB, id: string, withMembers: false, safe: false): Promise<schema.SelectRoom | null>;
export async function getRoom(
    db: DB,
    id: string,
    withMembers: boolean = true,
    safe: boolean = true,
): Promise<schema.SelectRoomWithMembers | schema.SelectRoom | schema.SelectRoomWithMembersSafe | schema.SelectRoomSafe | null> {
    const room = await db.query.roomTable.findFirst({ where: eq(schema.roomTable.id, id) });
    if (!room) return null;

    if (safe) {
        const { password, ...safeRoom } = room;
        const safeRoomWithFlag = { ...safeRoom, hasPassword: !!password };
        if (!withMembers) return safeRoomWithFlag as schema.SelectRoomSafe;
        const members = await db.query.roomMemberTable.findMany({ where: eq(schema.roomMemberTable.roomId, id) });
        return { ...safeRoomWithFlag, members: members.map((m) => m.userData) } as schema.SelectRoomWithMembersSafe;
    }

    if (!withMembers) return room;
    const members = await db.query.roomMemberTable.findMany({ where: eq(schema.roomMemberTable.roomId, id) });
    return { ...room, members: members.map((m) => m.userData) } as schema.SelectRoomWithMembers;
}

export async function createRoom(db: DB, name: string, password: string, hostUser: UserData, isPublic: boolean = true) {
    const [room] = await db
        .insert(schema.roomTable)
        .values({ name, password, hostUserId: hostUser.id, hostUserData: hostUser, isPublic })
        .returning();
    return room;
}

export async function addRoomMember(db: DB, roomId: string, user: UserData) {
    const room = await db.query.roomTable.findFirst({ where: eq(schema.roomTable.id, roomId) });
    if (!room) throw new Error("Room not found");
    await db
        .insert(schema.roomMemberTable)
        .values({ roomId: roomId, userId: user.id, userData: user })
        .onConflictDoUpdate({ target: schema.roomMemberTable.userId, set: { userData: user } });
}

export async function removeRoomMember(db: DB, roomId: string, user: UserData) {
    await db.delete(schema.roomMemberTable).where(and(eq(schema.roomMemberTable.roomId, roomId), eq(schema.roomMemberTable.userId, user.id)));
}

export async function playRoom(db: DB, roomId: string, song: EnhancedSong) {
    await db.update(schema.roomTable).set({ nowPlaying: song }).where(eq(schema.roomTable.id, roomId));
}

export async function addSongToQueue(db: DB, roomId: string, song: EnhancedSong) {
    const room = await db.query.roomTable.findFirst({ where: eq(schema.roomTable.id, roomId) });
    const queue = (room?.queue || []).filter((s) => s.videoId !== (song as any).videoId);
    queue.push(song as any);
    const [r] = await db.update(schema.roomTable).set({ queue }).where(eq(schema.roomTable.id, roomId)).returning();
    return r;
}

export async function removeSongFromQueue(db: DB, roomId: string, songID: string) {
    const room = await db.query.roomTable.findFirst({ where: eq(schema.roomTable.id, roomId) });
    const queue = (room?.queue || []).filter((s) => s.videoId !== songID);
    await db.update(schema.roomTable).set({ queue }).where(eq(schema.roomTable.id, roomId));
}

export async function setQueue(db: DB, roomId: string, songs: EnhancedSong[]) {
    await db.update(schema.roomTable).set({ queue: songs }).where(eq(schema.roomTable.id, roomId));
}

export async function toggleRoomVisibility(db: DB, roomId: string) {
    const room = await db.query.roomTable.findFirst({ where: eq(schema.roomTable.id, roomId) });
    await db.update(schema.roomTable).set({ isPublic: !room!.isPublic }).where(eq(schema.roomTable.id, roomId));
    return !room!.isPublic;
}

export async function renameRoom(db: DB, roomId: string, name: string) {
    await db.update(schema.roomTable).set({ name }).where(eq(schema.roomTable.id, roomId));
}

export async function deleteRoom(db: DB, roomId: string) {
    await db.delete(schema.roomTable).where(eq(schema.roomTable.id, roomId));
}
