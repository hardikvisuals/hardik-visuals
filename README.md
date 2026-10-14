# Hardik Visuals — optimized release v16

This is the website source for the existing Cloudflare Pages + R2 deployment.

## Upload to your existing GitHub repository

1. Extract `hardik-visuals-v16-final.zip`.
2. Open the extracted `hardik-visuals` folder. Upload its **contents** into your existing repository root, replacing matching files. `package.json`, `src`, `public`, and `scripts` must be at the root — do not add another nested `hardik-visuals` folder.
3. Commit the upload. Keep your existing Cloudflare Pages GitHub connection.
4. Build command: `npm run build`. Output directory: `dist`. Node: version 24 (the supplied `.node-version` also specifies it).
5. Keep your existing `VITE_ASSETS_BASE_URL` public R2 URL. The source also defaults to your current public media URL if that setting is absent. Do not set it to `/` for production.
6. Wait for the deployment to succeed, then open the live URL on your phone. Close an old tab or refresh to get the new build.

**No new R2 upload is required for v16.** The optimized intro, animated mascot, About hero portrait, and sharing image are included under `public/optimized`. Your existing portfolio videos, audio, and other About photos continue to use R2. Keep existing media in R2.

## Local development

Install Node 24, then run:

```sh
npm ci
npm run dev
```

The default public R2 URL loads the existing media. For a full offline media copy, copy your original `assets` and `portfolio` folders into `public`, and use `VITE_ASSETS_BASE_URL=/` in an uncommitted `.env.local`.

```sh
npm run check
npm run preview
```

The build creates `dist/about.html` with About-specific metadata and `dist/404.html` for Cloudflare's real 404 responses. `public/_redirects` deliberately has no catch-all rewrite. Upload that file with this release so an older catch-all does not override 404 handling.

## Mobile test after deployment

- Watch the intro, then enter with sound and without sound. A skip option appears after two seconds; the full film remains available.
- Tap the mascot once and hold it. The hint should emerge below it and disappear after interaction.
- Open/close the menu several times; visit About from both the menu and profile button.
- Play a project, use its native video controls, then close it.
- Scroll About to the end; rotate the phone/tablet and try the navigation links.
- Try reduced motion and the browser Back button.

## Release notes

See `CHANGES.md` and `QA-REPORT.md` for the changes, measured asset reductions, checks performed, and the remaining real-device verification scope.
