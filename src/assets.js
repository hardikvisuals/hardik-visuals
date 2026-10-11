// Public media origin only, never a token or secret. Set this before building.
// The existing public R2 bucket is the default. Use / for a full local media copy.
export const ASSETS_BASE_URL = (import.meta.env.VITE_ASSETS_BASE_URL || "https://pub-b03a7af5516b456ebe564219ef06e245.r2.dev/hardik-visuals-r2-media")
  .trim()
  .replace(/\/+$/, "");
const localMedia = import.meta.env.VITE_ASSETS_BASE_URL?.trim() === "/";

export function asset(path) {
  const clean = path.replace(/^\/+/, "");
  if (ASSETS_BASE_URL || localMedia) {
    return `${ASSETS_BASE_URL}/${clean.split("/").map(encodeURIComponent).join("/")}`;
  }
  if (/\.(mp4|webm|mov)$/i.test(clean)) return "/placeholders/video.mp4";
  if (/\.(mp3|wav|ogg)$/i.test(clean)) return "/placeholders/audio.wav";
  return "/placeholders/image.svg";
}
