import React, { useMemo } from 'react';
import { Platform, StyleSheet, useWindowDimensions, View } from 'react-native';

import { BrandBanner } from '@/components/common/BrandBanner';
import { CampaignSwitcher } from '@/components/common/CampaignSwitcher';
import { TopBar } from '@/components/common/TopBar';
import { CampaignOverlay } from '@/components/overlay/CampaignOverlay';
import { FeedRenderer } from '@/renderer/FeedRenderer';
import { HOME_PAYLOAD } from '@/data/payload';
import { useActiveCampaign } from '@/state/campaignStore';
import { ThemeProvider } from '@/theme/ThemeContext';
import { layout } from '@/theme/tokens';
import type { Theme } from '@/types/schema';

/**
 * The SDUI homepage.
 *
 * Composition order matters:
 *   1. Resolve the active theme — the active campaign's theme overrides the
 *      baseline payload theme. This single value drives the whole OTA repaint.
 *   2. Wrap everything in one ThemeProvider so chrome + feed sample one palette.
 *   3. Render the single vertical feed (the TopBar delivery bar is sticky chrome
 *      above it; the brand banner + campaign switcher ride in the list header).
 *   4. Layer the campaign overlay last, on top, with pointerEvents="none".
 *
 * Responsiveness: the same tree drives phone, tablet and desktop web. On wide
 * viewports the app is constrained to a centered phone-width column (with a
 * muted page backdrop) so it never stretches into an unusable full-bleed sheet.
 * Crucially the column uses `flex: 1` for its height on every breakpoint — a
 * percentage height does not give FlashList a measurable box on web, which is
 * what previously left the desktop view blank.
 */
export function HomeScreen(): React.ReactElement {
  const campaign = useActiveCampaign();
  const { width } = useWindowDimensions();

  const theme = useMemo<Theme>(
    () => campaign?.theme ?? HOME_PAYLOAD.theme,
    [campaign],
  );

  const isWide = width >= layout.wideBreakpoint;

  return (
    <ThemeProvider theme={theme}>
      {/* Page backdrop: on desktop a muted frame around the app column; on
          phones it is simply the themed background behind everything. */}
      <View
        style={[
          styles.page,
          { backgroundColor: isWide ? '#1B140C' : theme.background },
          isWide ? styles.pageCentered : null,
        ]}
      >
        <View
          style={[
            styles.column,
            { backgroundColor: theme.background },
            isWide ? styles.columnFramed : styles.columnFull,
          ]}
        >
          <TopBar />
          <FeedRenderer
            layout={HOME_PAYLOAD.layout}
            ListHeaderComponent={
              <View>
                <BrandBanner />
                <CampaignSwitcher />
              </View>
            }
          />
          {/* Overlay is scoped to the app column so the animation stays inside
              the device frame on desktop, and fills the screen on phones. */}
          {campaign ? <CampaignOverlay overlay={campaign.overlay} /> : null}
        </View>
      </View>
    </ThemeProvider>
  );
}

const styles = StyleSheet.create({
  page: { flex: 1 },
  pageCentered: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 28,
  },
  // `flex: 1` (not a percentage height) is what lets FlashList measure its box
  // on web — this is the fix for the previously-blank desktop layout.
  column: { flex: 1, overflow: 'hidden' },
  columnFull: { width: '100%' },
  columnFramed: {
    width: layout.appColumnWidth,
    maxWidth: '100%',
    borderRadius: 36,
    borderWidth: Platform.OS === 'web' ? 1 : 0,
    borderColor: '#00000014',
    shadowColor: '#000',
    shadowOpacity: 0.4,
    shadowRadius: 40,
    shadowOffset: { width: 0, height: 18 },
    elevation: 16,
  },
});
