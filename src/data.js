import { asset } from "./assets.js";

export const projects = [
  ["Otherworldly", "Visual storytelling", "1st/OtherWordly stack.mp4"],
  ["Deceived", "Valorant · 3D film", "deceived-v3.mp4"],
  ["Devyn Jato", "Creator storytelling", "3rd/Devyn Jato - Talking Head.mp4"],
  ["Thrive On", "Packaging · 3D visualization", "thrive-on.mp4"],
  ["FIFA 2026", "Title sequence", "5thh/FIFA 2026 Intro.mp4"],
  ["Kamoka", "The pearl story", "6th/Kamoka Pearl StoryTelling.mp4"],
  [
    "Brand launch",
    "Creative direction",
    "7th/Brand Launch - Creative Direction.mp4",
  ],
  [
    "Raw Dawg",
    "3D product campaign",
    "8th/Raw Dawg 3D Product Launch Campaign.mp4",
  ],
  ["Afterimage", "Motion study", "9th/AFTERIMAGE.mp4"],
].map(([title, category, file], i) => ({
  id: i,
  title,
  category,
  poster: asset(
    `assets/work/project-${i + 1}${i === 1 ? "-v3" : ""}.webp`,
  ),
  preview: asset(
    `assets/work/project-${i + 1}${i === 1 ? "-v3" : ""}-preview.mp4`,
  ),
  video: asset(`portfolio/${file}`),
  mobileVideo: asset(`portfolio/mobile/project-${i + 1}-v3.mp4`),
}));

export const tracks = [
  ["Holding you, Holding me", "holding-you-holding-me.mp3"],
  ["About You — The 1975", "about-you.mp3"],
  ["Notion", "notion.mp3"],
  ["Nutshell", "nutshell.mp3"],
  ["Stop Waiting", "stop-waiting.mp3"],
  ["Tek It", "tek-it.mp3"],
  ["Celeste — d4vd", "celeste.mp3"],
  ["Sukidakara — Yuika", "sukidakara.mp3"],
].map(([title, file]) => ({ title, src: asset(`assets/${file}`) }));

export const facts = [
  "Creative director. Visual storyteller.",
  "Every cut has a reason.",
  "An artist. An athlete. Always curious.",
  "Stories you feel. Work you remember.",
];
