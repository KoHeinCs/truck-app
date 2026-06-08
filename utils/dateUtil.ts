export function formatDmyDate(date: Date): string {
    const dd = String(date.getDate()).padStart(2, "0");
    const mm = String(date.getMonth() + 1).padStart(2, "0");
    const yyyy = String(date.getFullYear());
    return `${dd}/${mm}/${yyyy}`;
}

export function toIsoDate(dmy: string): string | null {
    const value = dmy.trim();
    const match = /^(\d{2})\/(\d{2})\/(\d{4})$/.exec(value);
    if (!match) return null;
    const [, dd, mm, yyyy] = match;
    const date = new Date(Number(yyyy), Number(mm) - 1, Number(dd));
    if (
        date.getFullYear() !== Number(yyyy) ||
        date.getMonth() !== Number(mm) - 1 ||
        date.getDate() !== Number(dd)
    ) {
        return null;
    }
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${date.getFullYear()}-${month}-${day}`;
}

export function todayIsoLocal(): string {
    const d = new Date();
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${y}-${m}-${day}`;
}

export function parseDmyToDate(dmy: string): Date | null {
    const iso = toIsoDate(dmy);
    if (!iso) return null;
    const [year, month, day] = iso.split("-").map(Number);
    if (!year || !month || !day) return null;
    return new Date(year, month - 1, day);
}

export function formatDate(value: string | null | undefined): string {

    if (!value || typeof value !== 'string') return "-";

    const trimmed = value.trim();
    if (!trimmed) return "-";

    // Split 'YYYY-MM-DD' on the dash
    const parts = trimmed.split("-");
    if (parts.length !== 3) return trimmed;

    const [yyyy, mm, dd] = parts;

    // Output: 15/03/2026
    return `${dd}/${mm}/${yyyy}`;
}

export function formatDateTime(value: string | null | undefined): string {

    if (!value || typeof value !== 'string') return "-";
    const trimmed = value.trim();
    if (!trimmed) return "-";

    // 1. Split the string into Date and Time parts
    // "2025-05-03 10:00:00" -> ["2025-05-03", "10:00:00"]
    const parts = trimmed.split(" ");
    if (parts.length < 2) return trimmed; // Fallback if unexpected format

    const datePart = parts[0]; // "2025-05-03"
    const timePart = parts[1]; // "10:00:00"

    // 2. Extract Year, Month, and Day
    const dateSegments = datePart.split("-");
    if (dateSegments.length !== 3) return trimmed;
    const [yyyy, mm, dd] = dateSegments;

    // 3. Extract Hours and Minutes (ignore seconds)
    const timeSegments = timePart.split(":");
    if (timeSegments.length < 2) return trimmed;
    const [rawHoursStr, min] = timeSegments;

    const rawHours = parseInt(rawHoursStr, 10);
    if (Number.isNaN(rawHours)) return trimmed;

    // 4. Calculate 12-hour AM/PM format manually
    const ampm = rawHours >= 12 ? "PM" : "AM";
    const hours12 = rawHours % 12 || 12; // Converts 0 to 12
    const hh = hours12.toString().padStart(2, "0");

    // Output: 03/05/2025 10:00 AM
    return `${dd}/${mm}/${yyyy} ${hh}:${min} ${ampm}`;
}






