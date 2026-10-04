import gsap from "gsap";
import { asset } from "../assets.js";
import { tracks } from "../data.js";

export function createAudio() {
  const music = new Audio();
  music.dataset.role = "soundtrack";
  music.hidden = true;
  document.body.appendChild(music);
  music.loop = true;
  music.preload = "none";
  const sounds = {
    hover: new Audio(asset("assets/hover.mp3")),
    click: new Audio(asset("assets/select.mp3")),
  };
  let enabled = false;
  let suspended = false;
  let chosen = 0;
  let lastEffect = 0;
  let version = 0;
  const fade = (volume, duration = 0.55) => {
    gsap.killTweensOf(music);
    gsap.to(music, { volume, duration, ease: "power2.out" });
  };
  async function play() {
    const token = ++version;
    if (!enabled || suspended || document.hidden) return;
    const wanted = new URL(tracks[chosen].src, location.href).href;
    if (music.src !== wanted) music.src = wanted;
    music.volume = 0;
    try {
      await music.play();
      if (token === version && enabled && !suspended) fade(0.14, 1.2);
    } catch {
      /* Keep the visible sound control available for a new user gesture. */
    }
  }
  function visibility() {
    if (document.hidden) {
      ++version;
      music.pause();
    } else play();
  }
  document.addEventListener("visibilitychange", visibility);
  return {
    setEnabled(value) {
      enabled = value;
      if (value) play();
      else {
        ++version;
        gsap.killTweensOf(music);
        music.pause();
        Object.values(sounds).forEach((s) => s.pause());
      }
    },
    select(index) {
      chosen = index;
      if (enabled) play();
    },
    suspend(value) {
      suspended = value;
      if (value) {
        ++version;
        gsap.killTweensOf(music);
        music.pause();
      } else play();
    },
    effect(type = "hover") {
      if (
        !enabled ||
        suspended ||
        document.hidden ||
        performance.now() - lastEffect < 120
      )
        return;
      lastEffect = performance.now();
      const sound = sounds[type];
      sound.volume = type === "hover" ? 0.045 : 0.11;
      sound.currentTime = 0;
      sound.play().catch(() => {});
    },
    dispose() {
      ++version;
      gsap.killTweensOf(music);
      music.pause();
      music.remove();
      Object.values(sounds).forEach((s) => s.pause());
      document.removeEventListener("visibilitychange", visibility);
    },
  };
}
