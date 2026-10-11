# Launch metadata — v14

Final brand/service title and natural-language sharing description; mascot sharing image; square mascot favicon. Home/About sitemap, robots, canonical metadata, static 404 and production source-map exclusion retained. No R2 changes required.

Visitors necessarily download frontend code and can inspect it; local browser edits do not modify the deployed website. Deployment write permissions belong to GitHub/Cloudflare account configuration. Search rankings, search-result images and platform preview refresh timing are not guaranteed. The three-second mascot hint remains on hold.

# Portrait framing — v13

Reframed the About hero to retain the full figure while trimming overhead foliage. Maintains a portrait aspect ratio across desktop, tablet and mobile. Build and mobile/desktop visual checks passed.

# Portrait swap — v12

Moved the outdoor white-shirt photograph from Fashion / Finding My Own Way into the About hero. Moved the gym hero into that former interest-card position, with a training caption. Updated hero preload and bundled the new image; no R2 changes required. The three-second mascot hint change remains on hold.

# Final polish — v11

- Persistent background soundtrack across gallery/About navigation, with an About sound toggle.
- Animated mascot replaces the About loading text.
- Brighter animated mascot invitation and green Hire Me proximity glow.
- Added 7+ million monthly reach to About.

# v10 — 10 October 2026

## Loading and media
- H.264 intro variants at 960, 1280 and 1920 pixels; the original 5.67-second choreography and frame rate are preserved. No upscaling. Fast-start metadata allows playback before the entire file downloads.
- Optimized animated WebP fallback, a static reduced-motion frame, and a ten-second stalled-media escape. Optional skip appears after two seconds.
- Gallery/Three.js initialize only after entry. Hidden gallery texture and profile portrait are deferred until entry. The intro unmounts after its exit finishes.
- Optimized mascot expressions retain all 131 frames, alpha, and original duration at 192×189, appropriate for its small display size. One next expression is prepared on gallery entry; compressed bytes are cached and each play starts a fresh animation. A synchronous lock prevents duplicate activation and stale callbacks are ignored.
- Phone/tablet video players use the existing mobile project encodes, with original-video fallback.
- Only the Latin font subsets used by the About copy are shipped.

## Interaction and rendering
- Subtle “click me!” invitation emerges beneath the mascot twice, then rests. The first interaction dismisses it. Reduced motion shows a static hint.
- Menu opening, view changes, closing and pending navigation have explicit cancellation and guards. Escape and rapid-close interactions work during animation.
- About module and local hero portrait prepare before navigation; stale requests are cancelled.
- The Figma board’s `transition from hero page` reference (7:288, Igloo Inc.) informed a camera push, momentary chromatic edge separation, layered mist, and a gradual reveal. Reduced motion uses a short fade. This adapts the reference’s motion language to the existing site rather than recreating its 3D scene.
- Spiral rendering sleeps behind overlays once its transition settles, and while the browser tab is hidden. Paused previews release video sources. Visible preview budgets: one phone, two tablet, three desktop.
- Custom cursor updates stop when settled. Touch layouts hide the decorative cursor.

## About Me
- Removed the complete personal-training statistics/challenge section: deadlift records, rep targets, first 10K, and push-up challenge links and copy. Retained the artist/athlete identity and existing photography.
- Desktop smooth scrolling uses a single GSAP-synchronized Lenis instance. Touch devices use native scrolling, with lighter parallax distances. Marquee work pauses when offscreen.
- Horizontal desktop pinning is created/destroyed when crossing the breakpoint. Tablets use a vertical three-column composition in both orientations; phones use two columns.
- Replaced the full Lottie player with the lightweight SVG player for the existing signature; reduced About JavaScript by about 38% (412 KB → 256 KB raw).
- Reserved media proportions, optimized the hero, and removed repeated image-load-triggered scroll refreshes.

## SEO and delivery
- Added canonical URLs, preferred title, descriptions, Open Graph/Twitter tags, Person/WebSite JSON-LD, social portrait, touch icon, robots.txt, sitemap.xml, About-specific HTML metadata, and branded 404 output.
- Explicitly disabled production source maps and added baseline Cloudflare static-response security/cache headers.
- Kept the existing public R2 media URL; bundled every newly required optimized asset so this release needs only the GitHub source upload.
- No live hosting, DNS, R2, or GitHub account changes were made.
