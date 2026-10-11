# QA report — 10 October 2026

Production build passed with About metadata and static 404 generation.

## Browser checks

Automated Chromium checks passed at phone (390 × 844), tablet (820 × 1180 and landscape), and desktop (1440 × 900) sizes. Checks covered intro variants, delayed gallery loading, WebGL rendering, mascot interaction, menu open/close and navigation, About content and overflow, return to work, and tablet rotation. No page errors or failed HTTP responses were recorded in the primary suite.

Additional checks passed for reduced motion, rapid menu interaction, mobile project video decoding, direct About entry, and desktop horizontal-scroll pin removal/restoration across tablet resizing. Requested personal training milestones and challenge links were removed.

## Performance evidence

A single local Chromium simulation at 1.6 Mbps, 150 ms latency and 4× CPU slowdown recorded LCP 2.368 seconds, CLS 0.00213, and the skip entry becoming available at 3.612 seconds. This is a lab observation, not field Core Web Vitals or a guarantee for every device. INP was not measured.

The complete mobile intro is approximately 63 KB, compared with the original 5.53 MB video. Animated mascot expressions retain all 131 frames and are approximately 0.69–0.73 MB each, compared with approximately 4 MB each. Mobile intro SSIM was 0.999847 against the original scaled to the same resolution.

The locked production dependency audit returned zero known advisories. This does not constitute a comprehensive security audit.

## Remaining deployment verification

Actual iOS/Safari, Android hardware and Windows devices were not tested. Use the README mobile checklist after uploading. The local preview does not validate Cloudflare headers, deployment redirects or live R2 behavior. No live infrastructure or repository was modified.

## v11 follow-up

Production build and targeted Chromium checks passed: the same playing audio element survives navigation into About and back; About mute/unmute works; mobile layout has no horizontal overflow; reach text is present; delayed About code loading shows the mascot; no runtime errors. Mobile screenshots inspected. Physical-device limitations above still apply.
