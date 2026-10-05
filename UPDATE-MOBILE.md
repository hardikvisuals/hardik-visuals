# Apply the mobile update — 4 October 2026

These changes are prepared locally. They are not yet on the live website.

## What changed

- Full motion is now the default. The visitor can choose reduced motion with the existing control; that choice remains in the page URL.
- Mobile uses the same 6.6-second intro as a small animated WebP, so it does not need iPhone video autoplay permission or a separate Play introduction button. Desktop still uses the original video, with the image animation as its autoplay fallback. Music still starts only after Enter with sound.
- All nine films have 720p mobile copies with lower bitrates and fast-start metadata. Devyn Jato is 4.7 MB instead of 14.3 MB. Actual startup time still depends on the mobile network and hosting.
- Only one spiral preview plays at once on mobile. Opening a film releases background spiral video requests.
- Deceived now uses the supplied **Deceived - Valorant 3D revised again .mp4**, exported to new versioned desktop/mobile files with an updated thumbnail and preview. Originals are preserved.

## 1. Upload the new media FIRST

Extract `hardik-visuals-mobile-media-update.zip` outside the code folder. It contains only 13 new media files, under `assets` and `portfolio`.

In Cloudflare, open **R2 → hardik-visuals-media → hardik-visuals-r2-media/**. Merge the extracted `assets` and `portfolio` contents into the matching folders there. Preserve subfolders. Do not upload the ZIP or its enclosing extraction folder as an additional path. Do not delete the existing media.

Required new object paths inside `hardik-visuals-r2-media/`:

```text
assets/intro-motion-v2.webp
assets/work/project-2-v3.webp
assets/work/project-2-v3-preview.mp4
portfolio/deceived-v3.mp4
portfolio/mobile/project-1-v3.mp4
portfolio/mobile/project-2-v3.mp4
portfolio/mobile/project-3-v3.mp4
portfolio/mobile/project-4-v3.mp4
portfolio/mobile/project-5-v3.mp4
portfolio/mobile/project-6-v3.mp4
portfolio/mobile/project-7-v3.mp4
portfolio/mobile/project-8-v3.mp4
portfolio/mobile/project-9-v3.mp4
```

Check this exact URL plays before updating the code:
https://pub-b03a7af5516b456ebe564219ef06e245.r2.dev/hardik-visuals-r2-media/portfolio/mobile/project-2-v3.mp4

## 2. Upload the changed code to your EXISTING GitHub repository

Extract `hardik-visuals-code-update.zip`. Open the extracted folder and locate **src**. On the main page of `hardikvisuals/hardik-visuals`, choose **Add file → Upload files** and drag that **src folder** into GitHub. Its inner paths must remain `src/components/...`, `src/motion/...`, and `src/data.js`.

Commit with message **Improve mobile playback and update Deceived**. This replaces the included source files and preserves the rest of your repository. Cloudflare automatically builds the new commit. Wait for its deployment to succeed, then refresh the site on your phone.

Keep your current environment variable for now:

```text
VITE_ASSETS_BASE_URL=https://pub-b03a7af5516b456ebe564219ef06e245.r2.dev/hardik-visuals-r2-media
```

## 3. Connect the domain you bought through Cloudflare

Open **Workers & Pages → hardik-visuals → Custom domains → Set up a domain**. Enter **hardikvisuals.com**, continue, and confirm the proposed DNS record. Wait for Active. You can also add **www.hardikvisuals.com** using the same flow. Keep unrelated DNS records, particularly email records, unchanged.

Your existing site stays on the same Pages project. The free `pages.dev` address continues to work unless you separately configure a redirect. [Cloudflare custom-domain instructions](https://developers.cloudflare.com/pages/configuration/custom-domains/).

## 4. Use a production media address

Open **R2 → hardik-visuals-media → Settings → Custom Domains → Add** and connect **media.hardikvisuals.com**. Wait for Active, then check `https://media.hardikvisuals.com/hardik-visuals-r2-media/assets/portrait.jpg` loads.

Change `VITE_ASSETS_BASE_URL` in the Pages Production and Preview build settings to:

```text
https://media.hardikvisuals.com/hardik-visuals-r2-media
```

Trigger a fresh deployment; Vite embeds this URL at build time. Your existing wildcard GET/HEAD CORS policy also covers the new website domain. The `r2.dev` endpoint is intended for testing and is rate-limited; custom domains support Cloudflare caching. [R2 public domain instructions](https://developers.cloudflare.com/r2/buckets/public-buckets/).

## Verify after deployment

On the iPhone, reload with no `?motion=reduced` in the address. Check the intro reaches Enter with sound without a separate play tap; the spiral moves; Devyn Jato and Deceived play; and the reduced-motion control still works when selected. Also check desktop still uses the higher-resolution films.

The local browser check is not a physical iPhone/4G performance measurement. If loading remains slow after the new mobile files and custom media domain are active, adaptive streaming would be the next improvement.

Contact update: Instagram now follows email, WhatsApp and Calendly, with a smaller “More of me & my work” label and no permanent highlight. Arrows use monochrome text presentation on mobile.
