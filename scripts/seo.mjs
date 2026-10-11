import { readFile, writeFile } from "node:fs/promises";
const base = await readFile("dist/index.html", "utf8");
const description =
  "Meet Hardik, the creative director, video editor and motion designer behind Hardik Visuals. An artist’s eye, an athlete’s discipline, and a life in frames.";
let about = base
  .replace(
    /<title>.*?<\/title>/,
    "<title>About Hardik — Creative Director &amp; Artist | Hardik Visuals</title>",
  )
  .replace(/(<meta name="description" content=")[^"]*/, `$1${description}`)
  .replace(
    /(<meta property="og:description" content=")[^"]*/,
    `$1${description}`,
  )
  .replace(
    /(<meta property="og:title" content=")[^"]*/,
    "$1About Hardik — Creative Director &amp; Artist | Hardik Visuals",
  )
  .replace(
    /(<meta name="twitter:title" content=")[^"]*/,
    "$1About Hardik — Creative Director &amp; Artist | Hardik Visuals",
  )
  .replace(
    /(<meta name="twitter:description" content=")[^"]*/,
    `$1${description}`,
  )
  .replace(
    'rel="canonical" href="https://hardikvisuals.com/"',
    'rel="canonical" href="https://hardikvisuals.com/about"',
  )
  .replace(
    'property="og:url" content="https://hardikvisuals.com/"',
    'property="og:url" content="https://hardikvisuals.com/about"',
  );
await writeFile("dist/about.html", about);
await writeFile(
  "dist/404.html",
  `<!doctype html><html lang="en"><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><meta name="robots" content="noindex"><meta name="theme-color" content="#080908"><title>Page not found | Hardik Visuals</title><style>body{margin:0;background:#080908;color:#e7e9df;font-family:Arial,sans-serif;min-height:100vh;display:grid;place-content:center;text-align:center;padding:24px;box-sizing:border-box}h1{font-size:clamp(40px,8vw,96px);letter-spacing:-.06em;margin:20px 0}p{line-height:1.5}a{color:inherit;border:1px solid #666;border-radius:30px;padding:14px 24px;display:inline-block;margin-top:20px;text-decoration:none}</style><main><p>HARDIK VISUALS® / 404</p><h1>Outside the frame.</h1><p>This page couldn’t be found.</p><a href="/">Back to the work ↗</a></main></html>`,
);
console.log("Created route-specific About metadata and branded 404.");
