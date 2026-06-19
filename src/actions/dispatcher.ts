import { useCampaignStore } from '@/state/campaignStore';
import { useCartStore } from '@/state/cartStore';
import type {
  Action,
  ActionType,
  RawAction,
} from '@/types/schema';

/**
 * The Universal Action Dispatcher.
 *
 * Atomic layout components are fully ignorant of business logic — they only emit
 * the raw `RawAction` object the server bound to them. This module is the single
 * coordinator that validates that raw action and routes it to the correct local
 * execution block. Adding a new action type means adding one entry here, nowhere
 * else.
 *
 * Validation is defensive: a malformed or unknown action is logged and dropped,
 * never thrown — a bad action node must not crash an interaction.
 */

/** Narrowers per action type — each guards the payload shape it needs. */
const validators: {
  [K in ActionType]: (payload: Record<string, unknown>) => Action | null;
} = {
  ADD_TO_CART: (p) =>
    typeof p.id === 'string'
      ? {
          type: 'ADD_TO_CART',
          payload: {
            id: p.id,
            title: typeof p.title === 'string' ? p.title : undefined,
            price: typeof p.price === 'number' ? p.price : undefined,
          },
        }
      : null,
  DEEP_LINK: (p) =>
    typeof p.url === 'string'
      ? { type: 'DEEP_LINK', payload: { url: p.url } }
      : null,
  APPLY_MYSTERY_GIFT_COUPON: (p) =>
    typeof p.id === 'string'
      ? {
          type: 'APPLY_MYSTERY_GIFT_COUPON',
          payload: {
            id: p.id,
            couponHint:
              typeof p.couponHint === 'string' ? p.couponHint : undefined,
          },
        }
      : null,
  BOOK_EVENT: (p) =>
    typeof p.id === 'string' && typeof p.eventName === 'string'
      ? { type: 'BOOK_EVENT', payload: { id: p.id, eventName: p.eventName } }
      : null,
  OPEN_CAMPAIGN: (p) =>
    typeof p.campaignId === 'string'
      ? { type: 'OPEN_CAMPAIGN', payload: { campaignId: p.campaignId } }
      : null,
};

function isKnownActionType(type: string): type is ActionType {
  return Object.prototype.hasOwnProperty.call(validators, type);
}

/** Validates a raw wire action into a strict `Action`, or `null` if invalid. */
export function parseAction(raw: RawAction | undefined | null): Action | null {
  if (!raw || typeof raw.type !== 'string') return null;
  if (!isKnownActionType(raw.type)) return null;
  return validators[raw.type](raw.payload ?? {});
}

/**
 * The single entry point every interactive component calls. Accepts the raw
 * server action, validates it, and executes the matching local block.
 */
export function handleAction(raw: RawAction | undefined | null): void {
  const action = parseAction(raw);
  if (!action) {
    if (__DEV__) {
      console.warn('[dispatcher] dropped invalid action:', raw);
    }
    return;
  }

  switch (action.type) {
    case 'ADD_TO_CART':
      useCartStore.getState().add(action.payload.id);
      break;
    case 'APPLY_MYSTERY_GIFT_COUPON':
      // A mystery coupon both reveals a gift (the cart) and is itself a cart add.
      useCartStore.getState().add(action.payload.id);
      if (__DEV__) {
        console.log('[dispatcher] mystery gift unlocked', action.payload);
      }
      break;
    case 'OPEN_CAMPAIGN':
      useCampaignStore.getState().setActive(action.payload.campaignId);
      break;
    case 'BOOK_EVENT':
      if (__DEV__) {
        console.log('[dispatcher] booking event', action.payload.eventName);
      }
      break;
    case 'DEEP_LINK':
      // In a real app this would defer to a navigation/linking service.
      if (__DEV__) {
        console.log('[dispatcher] deep link ->', action.payload.url);
      }
      break;
    default: {
      // Exhaustiveness guard: if a new ActionType is added without a case here,
      // TypeScript fails the build.
      const _never: never = action;
      return _never;
    }
  }
}
