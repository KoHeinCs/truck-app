import { isAxiosError } from "axios";

type ErrorCatalog = Record<string, { title?: string; content?: string } | undefined>;

function readApiPayload(data: unknown): { code?: string; message?: string } {
  if (!data || typeof data !== "object") return {};
  const o = data as Record<string, unknown>;
  const code = typeof o.code === "string" ? o.code.trim() : undefined;
  const message = typeof o.message === "string" ? o.message.trim() : undefined;
  return {
    code: code || undefined,
    message: message || undefined,
  };
}

/** Maps API `code` to locale `error.json` entries; falls back to server `message` then generic copy. */
export function getApiErrorAlertCopy(
  err: unknown,
  catalog: ErrorCatalog,
  fallback: { title: string; message: string },
): { title: string; message: string } {
  const data = isAxiosError(err) ? err.response?.data : undefined;
  const { code, message } = readApiPayload(data);

  if (code) {
    const entry = catalog[code];
    if (entry?.content) {
      return {
        title: (entry.title && entry.title.trim()) || fallback.title,
        message: entry.content,
      };
    }
  }

  return {
    title: fallback.title,
    message: message || fallback.message,
  };
}
