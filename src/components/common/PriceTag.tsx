import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { useTheme } from '@/theme/ThemeContext';
import { radius, spacing, type } from '@/theme/tokens';

/**
 * Signature element: a slightly tilted price-tag chip. It is the one playful
 * flourish that makes a Kiddo product card instantly recognizable. Everything
 * else around it stays quiet.
 */
interface PriceTagProps {
  price: number;
  mrp?: number;
}

function PriceTagBase({ price, mrp }: PriceTagProps): React.ReactElement {
  const theme = useTheme();
  return (
    <View style={styles.row}>
      <View style={[styles.tag, { backgroundColor: theme.primary }]}>
        <Text style={[styles.price, { color: theme.onPrimary }]}>₹{price}</Text>
      </View>
      {mrp !== undefined && mrp > price ? (
        <Text style={[styles.mrp, { color: theme.textMuted }]}>₹{mrp}</Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  tag: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 3,
    borderRadius: radius.sm,
    transform: [{ rotate: '-3deg' }],
  },
  price: { ...type.price },
  mrp: { ...type.caption, textDecorationLine: 'line-through' },
});

export const PriceTag = React.memo(PriceTagBase);
