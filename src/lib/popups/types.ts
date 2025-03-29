export interface PopupsStore {
    showPlDeletePopup: boolean;
    showPlRenamePopup: boolean;
    playlistData?: { name: string; id: string } | null;
}
