/**
 * Non-themable design primitives. Colors live in the OTA `Theme` (so the backend
 * can repaint them); everything here is structural and stable across campaigns —
 * the rhythm that keeps the brand feeling like Kiddo no matter the skin.
 */

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
} as const;

/**
 * Responsive layout constants shared by the screen frame. Keeping them here (not
 * inlined in HomeScreen) means the gutter the blocks pad with and the desktop
 * column width stay in one place.
 */
export const layout = {
  /** Above this width we render a centered app column instead of full-bleed. */
  wideBreakpoint: 700,
  /** Phone-width column used on tablet/desktop web. */
  appColumnWidth: 440,
  /** The single horizontal screen gutter every block aligns to. */
  gutter: 18,
} as const;

/** Generous, bouncy radii — the rounded "squircle" Kiddo signature. */
export const radius = {
  sm: 10,
  md: 16,
  lg: 22,
  xl: 28,
  pill: 999,
} as const;

export const fonts = {
  display: 'Baloo2_700Bold',
  displaySemi: 'Baloo2_600SemiBold',
  body: 'Nunito_600SemiBold',
  bodyBold: 'Nunito_800ExtraBold',
} as const;

export const type = {
  hero: { fontFamily: fonts.display, fontSize: 28, lineHeight: 32 },
  title: { fontFamily: fonts.display, fontSize: 20, lineHeight: 24 },
  sectionTitle: { fontFamily: fonts.displaySemi, fontSize: 18, lineHeight: 22 },
  cardTitle: { fontFamily: fonts.bodyBold, fontSize: 14, lineHeight: 18 },
  body: { fontFamily: fonts.body, fontSize: 14, lineHeight: 20 },
  caption: { fontFamily: fonts.body, fontSize: 12, lineHeight: 16 },
  price: { fontFamily: fonts.display, fontSize: 16, lineHeight: 18 },
} as const;

/** Soft, low, warm shadow shared by all elevated surfaces. */
export const elevation = {
  shadowColor: '#3A2A12',
  shadowOpacity: 0.1,
  shadowRadius: 12,
  shadowOffset: { width: 0, height: 6 },
  elevation: 4,
} as const;
