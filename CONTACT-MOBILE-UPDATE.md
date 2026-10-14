# Contact and mobile update — v15

## Files changed
- `index.html`: one no-JavaScript contact mailto link.
- `src/components/Menu.jsx`: two mailto links and two visible email labels (contact panel and menu footer, shared by desktop/mobile).
- `src/components/About.jsx`: one About footer mailto link.
- `src/components/Intro.jsx`: mobile video URL only.
- `src/polish.css`: a mobile/coarse-pointer override removes the CSS transform transition on menu labels that competes with GSAP's entrance transform.
- `public/optimized/intro-mobile-v15.mp4`: new 2560×1440 H.264 encode, 505,653 bytes, preserving the complete 5.667-second film and timing.
- `README.md`: release filename updated. This report is added as delivery documentation.

## Exact contact replacements
Six occurrences changed from `hardikvisuals.work@gmail.com` to `hardik@hardikvisuals.com`: four mailto targets and two visible text labels. Every public mailto target is now `mailto:hardik@hardikvisuals.com`.

There is no contact form or server-side form recipient in this project. JSON-LD, metadata, sitemap and configuration contained no old email references. No other public contact email addresses were found. Authentication/account configuration was not changed. Historical ZIPs/backups retain their historical content; no outdated public email remains in the current application source or new production build.

## Verification
- Existing syntax checks for spiral and audio passed.
- Vite production build and route metadata generation passed. These are the commands used by the project's check/build scripts; npm itself is not installed in this runtime, so the script commands were executed directly. No lint or typecheck scripts are defined.
- Chromium browser checks passed at 390×844 mobile and 1440×900 desktop.
- Contact CTA click targets and the About footer email click target passed on both viewports. The test intercepts mailto navigation to avoid opening an external mail application; OS mail-client configuration is not tested.
- Three open/contact/back/close menu cycles passed on each viewport; mobile label transform transition is disabled and desktop retains its existing transition. About navigation passed; no JavaScript runtime errors.
- Browser decoded the mobile intro at 2560×1440 and desktop intro at its unchanged 1920×1080; both retain the 5.667-second duration. Mobile autoplay fallback assets remain unchanged.
- Production email scan and packaged local asset references checked.
- Physical iOS/Android devices were not available; a device check of the menu motion after approval remains advisable.

## Scope preserved
Compared with the delivered v14 source, only the five implementation files listed above and the new mobile encode changed. GSAP code, Lenis, work browser, mascot interactions, audio, layout, typography, dependencies and Cloudflare settings remain unchanged. No deployment was performed.
