# Deploy Hardik Visuals

This package includes the latest spiral, contact panel, mascot fix and approved portrait framing. The build was verified locally. It has not yet been deployed to your Cloudflare account.

Use **Cloudflare Pages for the website** and **R2 for the media**. Follow steps 1–3, then choose either GitHub deployment or direct upload.

## 1. Extract the two ZIPs separately

- `hardik-visuals-github.zip`: extract this first. Work inside the `hardik-visuals` folder containing `package.json`.
- `hardik-visuals-r2-media.zip`: extract outside that folder. It contains `assets`, `portfolio`, and `MEDIA-MANIFEST.json`.

Keep the media outside the Git repository. The source package intentionally includes only tiny development placeholders. It needs your real public media URL before the production build.

## 2. Upload the media to R2

1. Sign in to Cloudflare. Open **R2 Object Storage**, create a bucket named `hardik-visuals-media`, and open it.
2. Upload the extracted `assets` and `portfolio` trees, preserving every folder and filename. If the upload picker doesn't retain folders, use **Create folder** and upload the files inside each matching folder. Do not upload the ZIP as a single object or add its enclosing folder to the object paths.
3. There are **61 required media objects**. The manifest lists their exact paths, sizes and content types. Folder-marker objects and the manifest itself do not count toward the 61.
4. Check these exact keys exist:

```text
assets/intro.mp4
assets/portrait.jpg
assets/mascot/start.webp
assets/mascot/smile.webp
assets/work/project-2-v3-preview.mp4
portfolio/thrive-on.mp4
portfolio/deceived-v3.mp4
```

Keep `video/mp4` for MP4, `video/webm` for WebM, `image/webp` for WebP, `image/jpeg` for JPG, and `audio/mpeg` for MP3. [Cloudflare upload instructions](https://developers.cloudflare.com/r2/objects/upload-objects/).

## 3. Make the media accessible

For a temporary preview without a domain, open the bucket's **Settings → Public Development URL → Enable**. Copy the actual `https://pub-....r2.dev` URL shown by Cloudflare. This endpoint is rate-limited and intended for development.

For sharing the portfolio with clients, connect a media subdomain such as `media.your-domain.com` under **Settings → Custom Domains → Add**. The domain must be in the same Cloudflare account. Wait for its status to become Active. [Public media URLs](https://developers.cloudflare.com/r2/buckets/public-buckets/).

Then open **Settings → CORS Policy → Add CORS policy → JSON**, paste the contents of `r2-cors.json` from the source package, and save. This lets the website use images and videos in the 3D gallery. The policy permits public GET/HEAD access; it does not grant upload access. [CORS setup](https://developers.cloudflare.com/r2/buckets/cors/).

Your media base URL is only the public HTTPS origin, without `/assets`, `/portfolio`, or an individual filename. Do not use the S3 API endpoint or credentials.

Before continuing, visit your base URL followed by `/assets/portrait.jpg` and `/portfolio/thrive-on.mp4`. The portrait and video should load. The bucket root itself does not list its files.

## 4A. Deploy through GitHub (recommended for continued updates)

Install Git if needed. Create an empty GitHub repository named `hardik-visuals`; leave README, license and gitignore initialization unchecked. In PowerShell, open the extracted folder containing `package.json`. Run these commands individually, replacing the three personal values:

```powershell
git init
git config user.name "Your Name"
git config user.email "you@example.com"
git add .
git commit -m "Launch Hardik Visuals portfolio"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/hardik-visuals.git
git push -u origin main
```

Complete GitHub sign-in if prompted. In Cloudflare, open **Workers & Pages → Create application → Pages → Import an existing Git repository**. Connect GitHub and select the repository.

| Setting | Exact value |
| --- | --- |
| Framework preset | None |
| Production branch | main |
| Root directory | Leave blank |
| Build command | `npm run build` |
| Build output directory | `dist` |
| Environment variable `NODE_VERSION` | `24.18.1` |
| Environment variable `VITE_ASSETS_BASE_URL` | Your public R2 media base URL from step 3 |

Set both variables in Production and Preview environments. Select **Save and Deploy**. Open the resulting `pages.dev` address. Later pushes to `main` deploy your updates. [Pages build and deployment](https://developers.cloudflare.com/pages/framework-guides/deploy-a-vite3-project/) · [Node version configuration](https://developers.cloudflare.com/pages/configuration/build-image/).

## 4B. Alternative: direct upload for a temporary launch

Choose this instead of step 4A if you want to upload a built folder without GitHub. A Direct Upload project cannot later become a Git-integrated project; that would require a new Pages project. [Direct Upload documentation](https://developers.cloudflare.com/pages/get-started/direct-upload/).

Install Node **24.18.1**. Open PowerShell in the clean extracted `hardik-visuals` source folder. Run:

```powershell
npm ci
$env:VITE_ASSETS_BASE_URL = Read-Host "Paste your public HTTPS R2 media base URL"
npm run build
npm run preview
```

Check the local preview with your real media. Stop the preview with Ctrl+C. In Cloudflare **Workers & Pages → Create application → Pages**, choose the direct-upload / drag-and-drop option. Upload the generated **dist folder**, give the project a name, and deploy. The source ZIP is not a prebuilt upload package.

For this route, the URL is embedded during your local build. Setting a variable in Cloudflare afterward cannot change already-built JavaScript. If the media URL changes, build again and upload the new `dist` folder.

## 5. Check the live site

- Intro plays, followed by the entry button.
- Spiral thumbnails appear and clicking a tile plays its film, including Thrive On and revised Deceived.
- Repeated mascot clicks stay visible and return to the starting face.
- The portrait, music and menu/contact links load on desktop and mobile.

If placeholders appear, check `VITE_ASSETS_BASE_URL` and rebuild. If media returns 404, compare object keys with the manifest. If files open directly but the spiral stays blank, check the R2 CORS policy; cached custom-domain responses may need purging after CORS changes. If a build reports an unsupported Node version, set `NODE_VERSION=24.18.1` and retry.

The GitHub package has no API keys, backend, `node_modules`, `dist`, or large portfolio media. Keep using the source package for GitHub and the media package for R2.
