import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { selectTotalCount, useCartStore } from '@/state/cartStore';
import { useTheme } from '@/theme/ThemeContext';
import { elevation, fonts, layout, radius, spacing, type } from '@/theme/tokens';

/**
 * Sticky top bar — the Q-commerce delivery selector + cart.
 *
 * The left side states the Kiddo delivery promise ("essentials at your door in
 * minutes"); the right is the cart pill. The whole bar samples the OTA theme so
 * it repaints per campaign.
 *
 * Re-render isolation: the cart pill subscribes to ONLY the derived total count,
 * so an add on any product card updates this number and nothing else in the
 * chrome re-renders. It lives outside the feed list, proving the count updates
 * without touching the 30+ feed rows.
 */
function TopBarBase(): React.ReactElement {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const count = useCartStore(selectTotalCount);

  return (
    <View
      style={[
        styles.bar,
        elevation,
        { backgroundColor: theme.surface, paddingTop: insets.top + spacing.md },
      ]}
    >
      <View style={styles.delivery}>
        <View style={styles.etaRow}>
          <View style={[styles.boltPill, { backgroundColor: theme.primary }]}>
            <Text style={styles.bolt}>⚡</Text>
          </View>
          <Text style={[styles.eta, { color: theme.text }]}>
            Delivery in 10 minutes
          </Text>
        </View>
        <Text style={[styles.addr, { color: theme.textMuted }]} numberOfLines={1}>
          to Home · Bengaluru 560001 <Text style={{ color: theme.primary }}>⌄</Text>
        </Text>
      </View>

      <View style={[styles.cart, { backgroundColor: theme.primary }]}>
        <Text style={styles.cartGlyph}>🛒</Text>
        <Text style={[styles.cartCount, { color: theme.onPrimary }]}>
          {count}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  bar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.md,
    paddingHorizontal: layout.gutter,
    paddingBottom: spacing.md,
    borderBottomLeftRadius: radius.xl,
    borderBottomRightRadius: radius.xl,
    zIndex: 2,
  },
  delivery: { flex: 1, gap: 3 },
  etaRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs + 2 },
  boltPill: {
    width: 22,
    height: 22,
    borderRadius: radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bolt: { fontSize: 12 },
  eta: { fontFamily: fonts.bodyBold, fontSize: 15, letterSpacing: 0.2 },
  addr: { fontFamily: fonts.body, fontSize: 12 },
  cart: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs + 2,
    borderRadius: radius.pill,
    minWidth: 58,
    justifyContent: 'center',
  },
  cartGlyph: { fontSize: 15 },
  cartCount: { ...type.cardTitle, minWidth: 12, textAlign: 'center' },
});

export const TopBar = React.memo(TopBarBase);
