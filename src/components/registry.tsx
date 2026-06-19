import React from 'react';

import { BannerHero } from '@/components/blocks/BannerHero';
import { DynamicCollection } from '@/components/blocks/DynamicCollection';
import { ProductGrid2x2 } from '@/components/blocks/ProductGrid2x2';
import type {
  BannerHeroProps,
  DynamicCollectionProps,
  KnownComponentType,
  Product,
  ProductGrid2x2Props,
  PropsByType,
  RawAction,
  RawNode,
} from '@/types/schema';

/**
 * The Component Registry — a runtime hash-map (Factory Pattern), NOT a switch.
 *
 * Each entry pairs:
 *   - `Component`: the React component that renders the block, and
 *   - `validate`: a guard that narrows the untrusted wire `props` into the
 *     strict props the component expects, returning `null` if the payload is
 *     structurally unusable.
 *
 * Registering a new block type is a one-line addition to `REGISTRY` — no
 * renderer changes, no switch to extend. Unknown types are simply absent from
 * the map and dropped by the resolver.
 */

interface RegistryEntry<T extends KnownComponentType> {
  Component: React.ComponentType<PropsByType[T]>;
  validate: (rawProps: unknown) => PropsByType[T] | null;
}

// ---- shared small validators -------------------------------------------------

function isRecord(v: unknown): v is Record<string, unknown> {
  return typeof v === 'object' && v !== null;
}

function asRawAction(v: unknown): RawAction {
  // Actions are validated again at dispatch time, so here we only need a shape
  // that the dispatcher can safely inspect. A missing/garbage action becomes a
  // no-op rather than a crash.
  if (isRecord(v) && typeof v.type === 'string') {
    return {
      type: v.type,
      payload: isRecord(v.payload) ? v.payload : undefined,
    };
  }
  return { type: '__NOOP__' };
}

function toProduct(v: unknown): Product | null {
  if (!isRecord(v)) return null;
  if (typeof v.id !== 'string') return null;
  if (typeof v.title !== 'string') return null;
  if (typeof v.price !== 'number') return null;
  if (typeof v.imageUrl !== 'string') return null;
  return {
    id: v.id,
    title: v.title,
    price: v.price,
    mrp: typeof v.mrp === 'number' ? v.mrp : undefined,
    badge: typeof v.badge === 'string' ? v.badge : undefined,
    imageUrl: v.imageUrl,
    action: asRawAction(v.action),
  };
}

function toProductList(v: unknown): Product[] {
  if (!Array.isArray(v)) return [];
  const out: Product[] = [];
  for (const raw of v) {
    const p = toProduct(raw);
    if (p) out.push(p); // drop malformed items, keep the good ones
  }
  return out;
}

// ---- per-type validators -----------------------------------------------------

function validateBannerHero(raw: unknown): BannerHeroProps | null {
  if (!isRecord(raw)) return null;
  if (typeof raw.title !== 'string') return null;
  if (typeof raw.imageUrl !== 'string') return null;
  return {
    title: raw.title,
    subtitle: typeof raw.subtitle === 'string' ? raw.subtitle : undefined,
    imageUrl: raw.imageUrl,
    ctaLabel: typeof raw.ctaLabel === 'string' ? raw.ctaLabel : undefined,
    action: asRawAction(raw.action),
  };
}

function validateGrid(raw: unknown): ProductGrid2x2Props | null {
  if (!isRecord(raw)) return null;
  const products = toProductList(raw.products);
  if (products.length === 0) return null; // nothing to show -> drop the block
  return {
    title: typeof raw.title === 'string' ? raw.title : undefined,
    products,
  };
}

function validateCollection(raw: unknown): DynamicCollectionProps | null {
  if (!isRecord(raw)) return null;
  if (typeof raw.collectionTitle !== 'string') return null;
  const products = toProductList(raw.products);
  if (products.length === 0) return null;
  return {
    collectionTitle: raw.collectionTitle,
    subtitle: typeof raw.subtitle === 'string' ? raw.subtitle : undefined,
    accent: typeof raw.accent === 'string' ? raw.accent : undefined,
    products,
  };
}

// ---- the registry map --------------------------------------------------------

const REGISTRY: { [T in KnownComponentType]: RegistryEntry<T> } = {
  BANNER_HERO: { Component: BannerHero, validate: validateBannerHero },
  PRODUCT_GRID_2X2: { Component: ProductGrid2x2, validate: validateGrid },
  DYNAMIC_COLLECTION: {
    Component: DynamicCollection,
    validate: validateCollection,
  },
};

function isKnownType(type: string): type is KnownComponentType {
  return Object.prototype.hasOwnProperty.call(REGISTRY, type);
}

/**
 * A node that survived validation and is ready to render. We pre-resolve to a
 * concrete element so the list's renderItem stays trivial and stable.
 */
export interface RenderableNode {
  id: string;
  type: KnownComponentType;
  element: React.ReactElement;
}

/**
 * Resolve one untrusted wire node into a renderable element, or `null` if it is
 * unknown or structurally invalid. This single function is where the
 * "fail gracefully, drop the node, preserve the tree" rule is enforced.
 */
export function resolveNode(raw: RawNode): RenderableNode | null {
  if (typeof raw.type !== 'string' || typeof raw.id !== 'string') return null;
  if (!isKnownType(raw.type)) {
    if (__DEV__) {
      console.warn(`[registry] dropping unknown component type: ${raw.type}`);
    }
    return null;
  }

  const type = raw.type;
  // Indexed access through the validated key; safe and fully typed.
  const entry = REGISTRY[type] as RegistryEntry<typeof type>;
  const props = entry.validate(raw.props);
  if (!props) {
    if (__DEV__) {
      console.warn(`[registry] dropping malformed ${type} (id=${raw.id})`);
    }
    return null;
  }

  const Component = entry.Component;
  return {
    id: raw.id,
    type,
    element: <Component {...props} />,
  };
}

/**
 * Resolve a full payload layout into a clean list of renderable nodes. Bad nodes
 * are filtered out so the feed only ever iterates valid, typed entries.
 */
export function resolveLayout(layout: readonly RawNode[]): RenderableNode[] {
  const out: RenderableNode[] = [];
  for (const raw of layout) {
    const resolved = resolveNode(raw);
    if (resolved) out.push(resolved);
  }
  return out;
}
