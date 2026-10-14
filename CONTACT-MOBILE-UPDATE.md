# Gmail compose update — v16

All four email link targets now use Gmail’s web compose URL with hardik@hardikvisuals.com prefilled. They open a new tab. The visitor must be signed into Gmail or complete Google sign-in. The website does not send an email automatically.

Changed implementation files: index.html (no-JavaScript link), src/components/Menu.jsx (contact panel and menu footer), src/components/About.jsx (About footer). Visible email text is unchanged.

The previous v15 mobile fixes are included. No layout, animation, interaction outside email navigation, dependency, or hosting configuration changed. No deployment performed.

Verification: production build and syntax checks passed. Desktop/mobile browser checks captured all three visible CTA clicks opening Gmail compose with the correct recipient. The external Gmail response was intercepted for this test; no Google account was accessed or email sent. The no-JavaScript link target was also checked in the generated HTML.
