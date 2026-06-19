# Asset credits

## Brand

`assets/kiddo-logo.png` — the Kiddo wordmark/logo, used in the loading screen and
the in-app brand banner.

## Campaign overlays

The campaign engine resolves two overlay kinds:

| Campaign | Overlay kind | Motif | Source |
|----------|--------------|-------|--------|
| Back to School Mega-Sale | `particles` (built-in) | Falling pencils / paper planes ✏️✈️📚📐 | Native `Animated` particle field — no external asset |
| Summer Playhouse Festival | `particles` (built-in) | Rising beach bubbles 🫧🏖️🐚🌊 | Native `Animated` particle field — no external asset |
| Mystery Gift Carnival | `lottie` | Confetti burst | `assets/lottie/mystery_carnival.json` — public Lottie from `wordpress-mobile/WordPress-Android` (`WordPress/src/main/res/raw/confetti.json`, GPL-2.0) |

The two `particles` overlays replaced heavy full-screen Lottie sheets that
dominated the page. The native particle field is deliberately **sparse**,
theme-aware, and identical on web + native (no Lottie/WebP web-compat caveats),
so it reads as a festive layer without occluding the UI. The Mystery campaign
keeps a real Lottie to exercise the streamed-animation + cache pipeline; it is
valid Lottie JSON, transparent, and free of external image dependencies. Replace
freely with your own licensed assets for any non-demo use.
