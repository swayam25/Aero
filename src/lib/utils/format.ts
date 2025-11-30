export function formatCount(n: number) {
    const sign = n < 0 ? "-" : "";
    const abs = Math.abs(n);
    const units: { suffix: string; value: number }[] = [
        { suffix: "T", value: 1_000_000_000_000 },
        { suffix: "B", value: 1_000_000_000 },
        { suffix: "M", value: 1_000_000 },
        { suffix: "k", value: 1_000 },
    ];
    for (const { suffix, value } of units) {
        if (abs >= value) {
            // Use floored base so 60,230 -> 60k+ (not 60.2k)
            const base = Math.floor(abs / value);
            const baseNumeric = base * value;
            const approx = baseNumeric !== abs;
            return `${sign}${base}${suffix}${approx ? "+" : ""}`;
        }
    }
    // For numbers less than 1000, show the full number (with locale grouping)
    const formatter = new Intl.NumberFormat("en");
    return `${sign}${formatter.format(abs)}`;
}
