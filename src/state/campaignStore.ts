import { create } from 'zustand';

import { findCampaign } from '@/data/campaigns';
import type { Campaign } from '@/types/schema';

/**
 * Holds which live campaign is currently active. In production this id would be
 * pushed down by the remote overlay context service; here a debug toggle drives
 * it so all three campaigns can be demonstrated (and recorded) on demand.
 *
 * `null` means "no campaign" — the baseline Kiddo skin with no overlay.
 */
interface CampaignState {
  activeId: string | null;
  setActive: (id: string | null) => void;
}

export const useCampaignStore = create<CampaignState>((set) => ({
  activeId: null,
  setActive: (id) => set({ activeId: id }),
}));

/** Resolves the active campaign object (or null) from the active id. */
export function useActiveCampaign(): Campaign | null {
  const activeId = useCampaignStore((s) => s.activeId);
  return findCampaign(activeId);
}
