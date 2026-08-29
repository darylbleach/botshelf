/** Grok Bot share/add URLs look like https://x.ai/bot/Y7LbP6p5EBFjfdTp69cKr */

export const GROK_BOT_URL_RE =
  /^https:\/\/x\.ai\/bot\/[A-Za-z0-9_-]{8,64}\/?$/;

export function isGrokBotUrl(url: string): boolean {
  try {
    const u = new URL(url);
    if (u.hostname !== "x.ai") return false;
    const parts = u.pathname.replace(/\/+$/, "").split("/").filter(Boolean);
    return parts.length === 2 && parts[0] === "bot" && parts[1].length >= 8;
  } catch {
    return false;
  }
}

export function grokBotIdFromUrl(url: string): string | null {
  if (!isGrokBotUrl(url)) return null;
  const parts = new URL(url).pathname.replace(/\/+$/, "").split("/").filter(Boolean);
  return parts[1] ?? null;
}

export function grokBotUrlFromId(id: string): string {
  return `https://x.ai/bot/${id.replace(/^\/+|\/+$/g, "")}`;
}

export function normalizeGrokBotUrl(input: string): string | null {
  const trimmed = input.trim();
  if (!trimmed) return null;
  if (isGrokBotUrl(trimmed)) return trimmed.replace(/\/+$/, "");
  // Allow pasting bare bot ids
  if (/^[A-Za-z0-9_-]{8,64}$/.test(trimmed)) {
    return grokBotUrlFromId(trimmed);
  }
  return null;
}
