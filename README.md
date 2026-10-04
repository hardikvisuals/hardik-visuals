# Hardik Visuals

React + Vite + Three.js; static site, no backend. Node **24.18.1** (pinned in `.node-version`).

Start with [DEPLOY-CLOUDFLARE.md](DEPLOY-CLOUDFLARE.md) for the complete deployment walkthrough, including a temporary launch without a domain or GitHub.

## Local run

From the extracted `hardik-visuals` folder:

```powershell
npm ci
npm run dev
```

Open http://127.0.0.1:4174/ (or append `?motion=full` to explicitly enable full motion).

```powershell
npm run build
npm run preview
```

Build output: **dist**. Stop the dev server with Ctrl+C before starting preview; both use port 4174.

## Media / R2

1. Blank `VITE_ASSETS_BASE_URL` uses the tiny bundled placeholders; it does not include the real films.
2. Extract the separate `hardik-visuals-r2-media.zip` **outside this repository**. Upload its `assets` and `portfolio` contents to your public R2 bucket, preserving paths such as `assets/intro.mp4` and `portfolio/thrive-on.mp4`. Do not upload the ZIP as one object.
3. Connect a public R2 custom domain; use its public HTTPS address, not an S3 API endpoint. In the bucket's Settings → CORS Policy → JSON, paste `r2-cors.json`. It permits public GET/HEAD media access, including browser video textures.
4. Copy `.env.example` to `.env.local`, set the public origin below, then restart Vite. Set the same variable in Cloudflare Pages **Production and Preview** environments before building; changing it requires a rebuild.

```dotenv
VITE_ASSETS_BASE_URL=https://media.your-domain.com
```

Use your own domain. No key/token belongs in a `VITE_` variable. `.env.local` stays out of Git.
For an entirely local real-media preview, copy the extracted `assets` and `portfolio` folders into `public`, then use `VITE_ASSETS_BASE_URL=/`; both folders are gitignored except the small favicon.
`MEDIA-MANIFEST.json` lists every required R2 object, size, MIME type and checksum. Preserve the supplied MIME types when uploading.

## GitHub — first push

Install Git, then create an **empty** GitHub repository named `hardik-visuals` (do not initialize it with README/license/gitignore). Open PowerShell in the extracted project folder; replace the example name, email and GitHub username below.

```powershell
git init
git config user.name "Your Name"
git config user.email "you@example.com"
git add .
git commit -m "Build Hardik Visuals portfolio"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/hardik-visuals.git
git push -u origin main
```

Complete GitHub sign-in if prompted. Do not place the separate media ZIP in this repository.

## Cloudflare Pages — exact settings

Workers & Pages → Create application → Pages → Import an existing Git repository → select `hardik-visuals`.

| Setting | Value |
| --- | --- |
| Framework preset | **None** (manual Vite settings) |
| Production branch | `main` |
| Root directory | Leave blank (repository root) |
| Build command | `npm run build` |
| Build output directory | `dist` |
| Environment variable | `NODE_VERSION=24.18.1` |
| Environment variable | `VITE_ASSETS_BASE_URL=https://media.your-domain.com` |

Save and Deploy. Future pushes rebuild the site. This package is prepared for deployment; it has not been uploaded to your GitHub or Cloudflare account.

## Tune / edit

- `src/motion/createSpiral.js`: `SPIRAL_CONFIG` at the top controls bend, full turns, depth blur, radius, tile size, saturation, inertia and video budget.
- `src/assets.js`: the single public media base URL and placeholder resolver.
- `src/data.js`: existing projects and soundtrack paths.
- `src/components/Menu.jsx`, `src/polish.css`: larger contact links and highlighted Instagram.
- `TREE.txt`: complete included file tree. `CHANGES.md`: files changed in this revision.

Official setup references: [Cloudflare Pages / Vite](https://developers.cloudflare.com/pages/framework-guides/deploy-a-vite3-project/) · [R2 CORS](https://developers.cloudflare.com/r2/buckets/cors/).
