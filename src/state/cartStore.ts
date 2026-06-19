import { create } from 'zustand';

/**
 * Cart state.
 *
 * The architectural mandate: incrementing the quantity of ONE product card must
 * not re-render the other 30+ blocks in the feed. Zustand makes this natural —
 * components subscribe to a *narrow slice* via a selector, so only the subtree
 * that reads a changed slice re-renders.
 *
 * - The header subscribes to `totalCount` only.
 * - Each product card subscribes to `quantities[itemId]` only — so a card whose
 *   quantity didn't change never re-renders.
 */

interface CartState {
  quantities: Record<string, number>;
  add: (id: string) => void;
  remove: (id: string) => void;
}

export const useCartStore = create<CartState>((set) => ({
  quantities: {},
  add: (id) =>
    set((state) => ({
      quantities: {
        ...state.quantities,
        [id]: (state.quantities[id] ?? 0) + 1,
      },
    })),
  remove: (id) =>
    set((state) => {
      const current = state.quantities[id] ?? 0;
      if (current <= 0) return state;
      return {
        quantities: { ...state.quantities, [id]: current - 1 },
      };
    }),
}));

/** Total items in cart. Recomputed only when `quantities` identity changes. */
export function selectTotalCount(state: CartState): number {
  let total = 0;
  for (const id in state.quantities) {
    total += state.quantities[id] ?? 0;
  }
  return total;
}

/**
 * Subscribe to a single product's quantity. Returning a primitive means the
 * card only re-renders when *its own* quantity changes — adding to one card
 * leaves every other card untouched.
 */
export function useItemQuantity(id: string): number {
  return useCartStore((state) => state.quantities[id] ?? 0);
}
