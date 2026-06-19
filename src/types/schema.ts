/**
 * SDUI schema contracts.
 *
 * These types model the JSON payload the production gateway streams to the
 * client. The client is a "dumb" renderer: it never hardcodes a screen, it only
 * understands these shapes. Everything the UI shows is derived from this schema.
 *
 * Design notes:
 * - Component nodes are a discriminated union keyed on `type`, so each block's
 *   `props` are exhaustively type-checked at the call site.
 * - The renderer, however, must tolerate *unknown* `type` strings arriving from
 *   a newer backend. So the wire-level payload is typed loosely (`RawNode`) and
 *   narrowed defensively at the registry boundary. This is the crux of the
 *   "structural resilience" requirement.
 */

// ---------------------------------------------------------------------------
// Actions
// ---------------------------------------------------------------------------

/**
 * Every interactive node carries a declarative action. Components stay ignorant
 * of what an action *does* — they just forward it to the dispatcher. The union
 * is open at the wire (see `RawAction`) but strongly typed once recognized.
 */
export type ActionType =
  | 'ADD_TO_CART'
  | 'DEEP_LINK'
  | 'APPLY_MYSTERY_GIFT_COUPON'
  | 'BOOK_EVENT'
  | 'OPEN_CAMPAIGN';

export interface AddToCartAction {
  type: 'ADD_TO_CART';
  payload: { id: string; title?: string; price?: number };
}

export interface DeepLinkAction {
  type: 'DEEP_LINK';
  payload: { url: string };
}

export interface ApplyMysteryGiftAction {
  type: 'APPLY_MYSTERY_GIFT_COUPON';
  payload: { id: string; couponHint?: string };
}

export interface BookEventAction {
  type: 'BOOK_EVENT';
  payload: { id: string; eventName: string };
}

export interface OpenCampaignAction {
  type: 'OPEN_CAMPAIGN';
  payload: { campaignId: string };
}

export type Action =
  | AddToCartAction
  | DeepLinkAction
  | ApplyMysteryGiftAction
  | BookEventAction
  | OpenCampaignAction;

/**
 * The loosely-typed action exactly as it arrives over the wire. The dispatcher
 * validates this into a strict `Action` (or rejects it) at runtime.
 */
export interface RawAction {
  type: string;
  payload?: Record<string, unknown>;
}

// ---------------------------------------------------------------------------
// Domain models
// ---------------------------------------------------------------------------

export interface Product {
  id: string;
  title: string;
  /** Price in whole rupees. */
  price: number;
  /** Optional strike-through original price, also in whole rupees. */
  mrp?: number;
  imageUrl: string;
  /** Short merchandising tag e.g. "Bestseller", "₹99 deal". */
  badge?: string;
  action: RawAction;
}

// ---------------------------------------------------------------------------
// Component node props (the "known" blocks)
// ---------------------------------------------------------------------------

export interface BannerHeroProps {
  title: string;
  subtitle?: string;
  imageUrl: string;
  ctaLabel?: string;
  action: RawAction;
}

export interface ProductGrid2x2Props {
  title?: string;
  /** Up to 4 items render in a balanced 2x2 grid. Extra items are ignored. */
  products: Product[];
}

export interface DynamicCollectionProps {
  /** Server-pushed contextual theme name, e.g. "Snacks under ₹99". */
  collectionTitle: string;
  subtitle?: string;
  /** Optional accent override sampled by the row header pill. */
  accent?: string;
  products: Product[];
}

// ---------------------------------------------------------------------------
// Component nodes (discriminated union of known blocks)
// ---------------------------------------------------------------------------

/** Known block type signatures the registry can resolve today. */
export type KnownComponentType =
  | 'BANNER_HERO'
  | 'PRODUCT_GRID_2X2'
  | 'DYNAMIC_COLLECTION';

interface BaseNode {
  /** Stable server id, used for the list keyExtractor. */
  id: string;
}

export interface BannerHeroNode extends BaseNode {
  type: 'BANNER_HERO';
  props: BannerHeroProps;
}

export interface ProductGrid2x2Node extends BaseNode {
  type: 'PRODUCT_GRID_2X2';
  props: ProductGrid2x2Props;
}

export interface DynamicCollectionNode extends BaseNode {
  type: 'DYNAMIC_COLLECTION';
  props: DynamicCollectionProps;
}

export type ComponentNode =
  | BannerHeroNode
  | ProductGrid2x2Node
  | DynamicCollectionNode;

/** Props map keyed by component type — used to type the registry entries. */
export interface PropsByType {
  BANNER_HERO: BannerHeroProps;
  PRODUCT_GRID_2X2: ProductGrid2x2Props;
  DYNAMIC_COLLECTION: DynamicCollectionProps;
}

/**
 * A node exactly as it arrives over the wire — `type` and `props` are unknown
 * until validated. The renderer ingests `RawNode[]` and resilientily narrows
 * each entry to a `ComponentNode` (or drops it).
 */
export interface RawNode {
  id?: unknown;
  type?: unknown;
  props?: unknown;
}

// ---------------------------------------------------------------------------
// Theme + campaign overlay
// ---------------------------------------------------------------------------

/**
 * The OTA structural theme matrix. The backend can repaint the entire app by
 * shipping a new theme object — no binary release required.
 */
export interface Theme {
  primary: string;
  background: string;
  /** Secondary accent used for pills, tags and highlights. */
  accent: string;
  /** Surface color for cards sitting on `background`. */
  surface: string;
  /** Primary text color. */
  text: string;
  /** Muted text color for subtitles and captions. */
  textMuted: string;
  /** Foreground color that reads cleanly on top of `primary`. */
  onPrimary: string;
}

/**
 * Animation source kinds the overlay engine can resolve.
 *  - `lottie`  : a Lottie JSON animation (streamed remote, or bundled fallback).
 *  - `webp`    : an animated WebP/GIF served through the image cache pipeline.
 *  - `particles`: a built-in, theme-aware native particle field. This is a
 *    lightweight, deliberately *sparse* overlay that drifts a handful of motifs
 *    across the screen — tasteful by construction, identical on web and native,
 *    and never the page-dominating full-bleed graphic a heavy Lottie can become.
 */
export type OverlayAssetKind = 'lottie' | 'webp' | 'particles';

/** A drifting-motif overlay config (used by the `particles` kind). */
export interface ParticleField {
  /** Emoji motifs sprinkled across the screen, e.g. ['✏️','✈️']. */
  motifs: readonly string[];
  /** Drift direction — `false` falls down (confetti), `true` rises up (bubbles). */
  rise: boolean;
  /** How many particles to mount. Kept low so the overlay stays subtle. */
  count: number;
}

export interface FullScreenOverlay {
  type: 'FULL_SCREEN_OVERLAY';
  /** Canonical remote animation asset URL (streamed + cached in production). */
  animation_url: string;
  kind: OverlayAssetKind;
  /**
   * Optional bundled fallback (a `require(...)` module id). When present the
   * overlay engine renders this instead of streaming the remote URL — used here
   * so the demo animates reliably offline. In production this would be omitted
   * and the remote URL streamed through the cache pipeline.
   *
   * Metro resolves a `.json` require to the parsed animation object; a native
   * asset require resolves to a numeric module id — both are valid Lottie
   * sources, hence the loose type.
   */
  localAsset?: object | number;
  /** Config for the `particles` kind. */
  particles?: ParticleField;
}

export interface Campaign {
  id: string;
  /** Human label, e.g. "'Back to School' Mega-Sale". */
  name: string;
  theme: Theme;
  overlay: FullScreenOverlay;
}

// ---------------------------------------------------------------------------
// Top-level payload
// ---------------------------------------------------------------------------

/**
 * The full operational payload the homepage ingests. `theme` is the baseline
 * skin; an active campaign (if any) overrides it. `layout` is the ordered list
 * of blocks streamed into the single vertical feed.
 */
export interface HomePayload {
  /** Schema version, so the client can guard against incompatible payloads. */
  version: number;
  theme: Theme;
  layout: RawNode[];
}
