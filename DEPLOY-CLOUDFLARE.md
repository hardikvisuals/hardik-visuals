# Existing Cloudflare deployment

Use the instructions in README.md to replace the source in the existing GitHub repository.

- Build: `npm run build`
- Output: `dist`
- Node: 24
- Existing public media base: `https://pub-b03a7af5516b456ebe564219ef06e245.r2.dev/hardik-visuals-r2-media`
- No R2 media upload is required for this release.

The included `_headers` file adds nosniff, referrer policy, framing protection, a baseline CSP, and caching for versioned media and assets. It also marks Pages preview domains noindex. The CSP restricts objects, the base URL, and framing; it is not a strict script allowlist. This avoids silently breaking hosting-injected scripts.

No account-level Cloudflare changes were made. The existing r2.dev endpoint remains in use; a custom media domain with intentional cache rules is a future account-level improvement. DNS, WAF, HTTPS settings and Rocket Loader settings were not altered. The entry module carries `data-cfasync="false"` to prevent Rocket Loader from deferring that script; verify the deployed markup because the live account may transform responses.

After deployment, verify `/robots.txt`, `/sitemap.xml`, `/about`, and a nonexistent URL (should return 404). Submit `https://hardikvisuals.com/sitemap.xml` in your Search Console property. Metadata does not guarantee a particular Google search-result image or layout.

Reference documentation:
- https://developers.cloudflare.com/pages/configuration/headers/
- https://developers.cloudflare.com/pages/configuration/serving-pages/
- https://developers.cloudflare.com/r2/buckets/public-buckets/
