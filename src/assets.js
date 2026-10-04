// Public media origin only, never a token or secret. Set this before building.
// Blank uses the tiny development placeholders bundled in the GitHub package.
export const ASSETS_BASE_URL = (import.meta.env.VITE_ASSETS_BASE_URL || "")
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
