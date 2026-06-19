# Kiddo — Server-Driven UI Homepage Renderer

A production-shaped React Native homepage that is **entirely driven by a JSON
payload**. The client is a "dumb" rendering engine: it parses a heterogeneous
SDUI payload, builds the screen tree through a declarative **Component Registry
(Factory Pattern)**, injects an **OTA theme** through Context, and routes every
interaction through a single **Universal Action Dispatcher** — all so the
homepage can change for live campaigns (Diwali, Back to School, …) with **zero
App Store / Play Store releases**.

Built with **Expo SDK 54** (React Native 0.81, React 19), **TypeScript strict
mode**, `@shopify/flash-list` v2, `lottie-react-native`, `expo-image`, and
`zustand`. Runs on iOS, Android, and web from **one codebase** — including a
correctly measured, centered phone frame on desktop web.

---

## Run it

```bash
npm install
npm start          # then press: a (Android), i (iOS), or w (web)
# or directly:
npm run android
npm run ios
npm run web
npm run typecheck  # tsc --noEmit, strict
```

> First launch fetches the Baloo 2 / Nunito web fonts, so give it a moment on a
> cold start. (The Back-to-School and Summer overlays are built-in native
> particle fields; the Mystery Lottie is bundled locally — all animate instantly
> and offline.)

### On a physical iPhone (no emulator needed)
1. Install **Expo Go** (SDK 54) from the App Store.
2. `npm start`, then scan the QR with the iPhone **Camera app** (same Wi-Fi).
3. If it won't connect on Wi-Fi, use `npm run start:tunnel` and scan the new QR.

---

## Cross-platform & responsive

One codebase renders consistently on **iOS, Android, and web**:
- The particle overlays use the RN `Animated` API, so they behave identically on
  web and native. The Mystery Lottie also animates on web (`lottie-react-native`
  routes the bundled animation through `@lottiefiles/dotlottie-react`, sized via
  `webStyle`).
- On wide desktop viewports the app is constrained to a centered, device-framed
  phone-width column with a muted backdrop, so it never stretches into an
  unusable full-bleed sheet — mobile and desktop stay visually aligned
  (see `layout.wideBreakpoint` in `theme/tokens.ts`). The framed column sizes its
  height with `flex: 1` (not a percentage), which is what gives FlashList a
  measurable box on web — a percentage height left the desktop view blank.

---

## How to record the 3 campaign demo videos

The task asks for a reference video per campaign. There is a **LIVE CAMPAIGN**
chip row at the top of the feed that stands in for the remote overlay-context
service. To capture each one:

1. Start the app, screen-record the device/emulator.
2. Tap **Back to School** → whole feed repaints yellow/blue, pencils & paper
   planes drift over the top; scroll to show the feed stays fully interactive
   *through* the overlay.
3. Tap **Summer Playhouse** → ocean-blue repaint + rising beach bubbles.
4. Tap **Mystery Gift Carnival** → carnival-red repaint + Lottie confetti burst.
5. Add a product to the cart during any campaign to show the cart counter
   updating instantly without the feed flickering.

Switching is instant and requires no rebuild — that is the whole point.

---

## Architecture map

```
App.tsx                      Root: loads fonts (logo splash), mounts HomeScreen
 └─ HomeScreen                Resolves active theme, wraps tree in ThemeProvider
     ├─ TopBar                Sticky delivery bar; cart pill subscribes to total only
     ├─ FeedRenderer          THE single vertical FlashList (one virtualization boundary)
     │   ├─ header            BrandBanner (Kiddo logo) + CampaignSwitcher
     │   └─ FeedRow (memo)    One row per SDUI node
     │       └─ <block>       Resolved via the registry
     └─ CampaignOverlay       Full-screen particles / Lottie / WebP, pointerEvents="none"

src/
  types/schema.ts            All SDUI contracts (nodes, actions, theme, campaign)
  data/payload.ts            Heavy mock payload (incl. unknown + corrupt nodes)
  data/campaigns.ts          Baseline theme + 3 campaign profiles
  theme/ThemeContext.tsx     OTA theme Context provider + useTheme()
  theme/tokens.ts            Non-themable design primitives (spacing, radius, type)
  state/cartStore.ts         Zustand cart; per-item selectors for render isolation
  state/campaignStore.ts     Active campaign id
  actions/dispatcher.ts      handleAction(): validate + route every action
  components/registry.tsx    Component Registry (Factory) + defensive resolveNode
  components/blocks/         BANNER_HERO, PRODUCT_GRID_2X2, DYNAMIC_COLLECTION
  components/common/         ProductCard, QtyStepper, PriceTag, headers, chrome, BrandBanner
  components/overlay/        CampaignOverlay + CampaignParticles (native particle field)
  renderer/FeedRenderer.tsx  The single vertical list
  screens/HomeScreen.tsx     Composition root
```

---

## How each requirement is met

### A. JSON schema & Component Registry (Factory Pattern)
`src/components/registry.tsx` is a **runtime hash-map**, not a switch. Each entry
pairs a component with a `validate()` guard that narrows the untrusted wire props
into strict typed props. Registering a new block is a one-line map addition.

**Resilience:** `resolveNode()` drops any node whose `type` is unknown
(e.g. `NEW_COMPONENT_V2`) or whose props are structurally invalid, logging a
warning in dev and preserving the rest of the tree. The mock payload deliberately
contains `NEW_COMPONENT_V2`, a banner with no props, and a node with a numeric
`type` — all are silently skipped while their neighbours render.

### B. Dynamic Collections & virtualization boundaries
`DynamicCollection` nests a **horizontal `FlashList` inside the master vertical
`FlashList`**. The row has a fixed height (no reflow into the parent), FlashList
v2 auto-measures and recycles cells (bounded heap during heavy scroll), and the
orthogonal gesture axes mean horizontal panning never steals the vertical list's
momentum.

### C. Universal Action Dispatcher
Components are fully decoupled: they only emit the server's raw `action` object to
`handleAction()` (`src/actions/dispatcher.ts`). The dispatcher validates the raw
action into a strict `Action` and routes it (`ADD_TO_CART`, `DEEP_LINK`,
`APPLY_MYSTERY_GIFT_COUPON`, `BOOK_EVENT`, `OPEN_CAMPAIGN`). A `never` exhaustive
guard makes adding an action type a compile error until it is handled.

### D. High frame-rate optimization
One singular vertical `FlashList` (v2) streams the entire layout.
`keyExtractor` uses server-stable node ids; `getItemType` returns the block type
so FlashList recycles like-for-like; rows are pre-resolved elements wrapped in
`React.memo`, so scrolling never re-validates or rebuilds a block. (FlashList v2
auto-measures cells, so no `estimatedItemSize` is needed.)

### Advanced A. Remote overlay contexts (campaign engine)
Three distinct campaigns in `data/campaigns.ts`, each a full theme + a
`FULL_SCREEN_OVERLAY`. The overlay engine resolves three kinds: a **built-in,
theme-aware native particle field** (`particles`, used for Back to School's
pencils/planes and Summer's rising bubbles — sparse and tasteful by design), a
**Lottie** animation (Mystery confetti, exercising the streamed-animation + cache
pipeline), and an **animated WebP** path. `CampaignOverlay` renders the overlay
over the whole screen with `pointerEvents="none"` so the app underneath stays
fully interactive, and streams remote assets through Lottie / `expo-image`
`memory-disk` caching.

### Advanced B. OTA runtime theming
`ThemeProvider` injects the active palette once at the root; every skinnable
child samples it via `useTheme()`. Swapping campaigns swaps the theme object and
repaints the whole tree from one source of truth.

### Advanced C. Local state collocation (render isolation)
The cart lives in Zustand. Each `QtyStepper` subscribes to **only its own**
quantity slice (`useItemQuantity(id)`), and the header subscribes to **only** the
derived total. Adding to one card re-renders that one stepper and the counter —
**not** the other 30+ blocks in the feed. `ProductCard`, every block, and every
feed row are `React.memo` barriers.

---

## TypeScript strategy

`tsconfig.json` runs `strict` plus `noUncheckedIndexedAccess`,
`noImplicitOverride`, and `noFallthroughCasesInSwitch`. The wire types
(`RawNode`, `RawAction`) are intentionally loose (`unknown`-typed fields) and are
narrowed at the registry / dispatcher boundaries into the strict discriminated
unions (`ComponentNode`, `Action`) — so untrusted input can never leak an
unchecked shape into a component.
