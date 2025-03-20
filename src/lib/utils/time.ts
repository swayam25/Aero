export function formatTime(secs: number): string {
    const minutes = Math.floor(secs / 60);
    const seconds = Math.floor(secs % 60);
    if (minutes > 60) {
        const hours = Math.floor(minutes / 60);
        return `${hours}:${minutes}:${seconds < 10 ? "0" + seconds : seconds}`;
    }
    return `${minutes}:${seconds < 10 ? "0" + seconds : seconds}`;
}
