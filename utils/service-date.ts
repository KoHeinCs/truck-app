/** Display format used in proposal service date fields: `dd/mm/yyyy HH:mm`. */

const DISPLAY_RE = /^(\d{2})\/(\d{2})\/(\d{4})\s+(\d{2}):(\d{2})$/;

function parseDisplayParts(value: string) {
  const raw = value.trim();
  const match = DISPLAY_RE.exec(raw);
  if (!match) return null;

  const [, dd, mm, yyyy, hh, min] = match;
  const date = new Date(
    Number(yyyy),
    Number(mm) - 1,
    Number(dd),
    Number(hh),
    Number(min),
  );

  if (
    date.getFullYear() !== Number(yyyy) ||
    date.getMonth() !== Number(mm) - 1 ||
    date.getDate() !== Number(dd) ||
    date.getHours() !== Number(hh) ||
    date.getMinutes() !== Number(min)
  ) {
    return null;
  }

  return { dd, mm, yyyy, hh, min, date };
}

/** `dd/mm/yyyy HH:mm` -> `yyyy-MM-dd HH:mm:ss` for API payloads. */
export function parseServiceDateDisplayToApi(value: string): string | null {
  const parts = parseDisplayParts(value);
  if (!parts) return null;
  return `${parts.yyyy}-${parts.mm}-${parts.dd} ${parts.hh}:${parts.min}:00`;
}

/** `dd/mm/yyyy HH:mm` -> `Date` for pickers. */
export function parseServiceDateDisplayToDate(value: string): Date | null {
  return parseDisplayParts(value)?.date ?? null;
}

/** `Date` -> `dd/mm/yyyy HH:mm` display string. */
export function formatServiceDateDisplay(date: Date): string {
  const dd = String(date.getDate()).padStart(2, "0");
  const mm = String(date.getMonth() + 1).padStart(2, "0");
  const yyyy = String(date.getFullYear());
  const hh = String(date.getHours()).padStart(2, "0");
  const min = String(date.getMinutes()).padStart(2, "0");
  return `${dd}/${mm}/${yyyy} ${hh}:${min}`;
}

/** API / ISO datetime -> `dd/mm/yyyy HH:mm` display string. */
export function parseServiceDateApiToDisplay(value: string): string {
  const raw = value.trim();
  if (!raw) return "";

  const match = /^(\d{4})-(\d{2})-(\d{2})[ T](\d{2}):(\d{2})/.exec(raw);
  if (match) {
    const [, yyyy, mm, dd, hh, min] = match;
    return `${dd}/${mm}/${yyyy} ${hh}:${min}`;
  }

  const parsed = new Date(raw.includes("T") ? raw : raw.replace(" ", "T"));
  if (Number.isNaN(parsed.getTime())) return "";
  return formatServiceDateDisplay(parsed);
}

/** Normalize API datetime to `yyyy-MM-dd HH:mm:ss`. */
export function normalizeServiceDateForApi(value: string): string {
  const raw = value.trim();
  if (!raw) return raw;

  const match = /^(\d{4})-(\d{2})-(\d{2})[ T](\d{2}):(\d{2})(?::(\d{2}))?/.exec(raw);
  if (match) {
    const [, yyyy, mm, dd, hh, min, sec = "00"] = match;
    return `${yyyy}-${mm}-${dd} ${hh}:${min}:${sec}`;
  }

  const parsed = new Date(raw.includes("T") ? raw : raw.replace(" ", "T"));
  if (Number.isNaN(parsed.getTime())) return raw;

  const yyyy = String(parsed.getFullYear());
  const mm = String(parsed.getMonth() + 1).padStart(2, "0");
  const dd = String(parsed.getDate()).padStart(2, "0");
  const hh = String(parsed.getHours()).padStart(2, "0");
  const min = String(parsed.getMinutes()).padStart(2, "0");
  const sec = String(parsed.getSeconds()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd} ${hh}:${min}:${sec}`;
}
