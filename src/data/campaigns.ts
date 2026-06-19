import type { Campaign, Theme } from '@/types/schema';

/**
 * The baseline Kiddo skin. This is the "default" OTA theme shipped in the
 * homepage payload (mirrors the brief's `{ "primary": "#FF9933", ... }`). An
 * active campaign overrides it wholesale.
 */
export const BASE_THEME: Theme = {
  primary: '#FF9933',
  background: '#FFF5E6',
  accent: '#FF5A5F',
  surface: '#FFFFFF',
  text: '#2B2118',
  textMuted: '#8A7E6E',
  onPrimary: '#FFFFFF',
};

/**
 * Three distinct live campaign profiles. Each one is a self-contained OTA
 * package: a full theme repaint plus a full-screen overlay animation. Switching
 * the active campaign instantly re-skins the entire feed and swaps the overlay —
 * no app binary update required, which is the whole point of SDUI.
 *
 * Overlay assets use public, reliably-hosted Lottie files so the cache pipeline
 * has something real to fetch. The `kind` flag lets the overlay engine pick the
 * right renderer (Lottie vs. WebP).
 */
export const CAMPAIGNS: readonly Campaign[] = [
  {
    id: 'back-to-school',
    name: "'Back to School' Mega-Sale",
    // Intense, high-contrast bright yellow + primary blue.
    theme: {
      primary: '#1457D6',
      background: '#FFF9DB',
      accent: '#FFD400',
      surface: '#FFFFFF',
      text: '#10243F',
      textMuted: '#5C6B82',
      onPrimary: '#FFFFFF',
    },
    overlay: {
      type: 'FULL_SCREEN_OVERLAY',
      // Paper airplanes / falling pencils, rendered as a sparse, tasteful
      // particle field instead of a page-dominating Lottie sheet.
      animation_url: 'https://assets.example.com/back_to_school.json',
      kind: 'particles',
      particles: {
        motifs: ['✏️', '✈️', '📚', '📐', '⭐', '📒'],
        rise: false,
        count: 12,
      },
    },
  },
  {
    id: 'summer-playhouse',
    name: "'Summer Playhouse' Festival",
    // Cool, fluid ocean blue palette.
    theme: {
      primary: '#0288D1',
      background: '#E3F6FB',
      accent: '#00C2A8',
      surface: '#FFFFFF',
      text: '#0A2A33',
      textMuted: '#5E7C84',
      onPrimary: '#FFFFFF',
    },
    overlay: {
      type: 'FULL_SCREEN_OVERLAY',
      // Water splash / beach-ball motif as gently *rising* bubbles — a calm,
      // oceanic particle field rather than a full-screen WebP that covers the UI.
      animation_url: 'https://assets.example.com/summer_splash.webp',
      kind: 'particles',
      particles: {
        motifs: ['🫧', '🏖️', '🐚', '⛱️', '🌊', '☀️'],
        rise: true,
        count: 12,
      },
    },
  },
  {
    id: 'mystery-gift-carnival',
    name: "'Mystery Gift Carnival'",
    // Explicit carnival red festival theme.
    theme: {
      primary: '#E53935',
      background: '#FFF0EE',
      accent: '#FFB300',
      surface: '#FFFFFF',
      text: '#3A1412',
      textMuted: '#9A6B66',
      onPrimary: '#FFFFFF',
    },
    overlay: {
      type: 'FULL_SCREEN_OVERLAY',
      // Bursting / falling confetti (real Lottie bundled locally; see CREDITS.md).
      animation_url:
        'https://assets.example.com/confetti_carnival.json',
      kind: 'lottie',
      localAsset: require('../../assets/lottie/mystery_carnival.json'),
    },
  },
] as const;

export type CampaignId = (typeof CAMPAIGNS)[number]['id'];

export function findCampaign(id: string | null): Campaign | null {
  if (!id) return null;
  return CAMPAIGNS.find((c) => c.id === id) ?? null;
}
