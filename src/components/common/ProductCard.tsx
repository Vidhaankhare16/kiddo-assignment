import { Image } from 'expo-image';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { PriceTag } from '@/components/common/PriceTag';
import { QtyStepper } from '@/components/common/QtyStepper';
import { useTheme } from '@/theme/ThemeContext';
import { elevation, radius, spacing, type } from '@/theme/tokens';
import type { Product } from '@/types/schema';

/**
 * A single product tile, shared by the 2x2 grid and the horizontal collection.
 *
 * Layout follows the familiar q-commerce card: a square image with the badge
 * pinned top-left and the ADD / quantity control overhanging the image's
 * bottom-right corner, then the title and price beneath. The control overhang is
 * the recognisable Blinkit/Zomato affordance and keeps the "add" target in a
 * consistent, thumb-reachable spot in every card width.
 *
 * It is a pure presentational atom: it renders product data and delegates the
 * "add" interaction to the QtyStepper (which owns the only per-item
 * subscription). The card has no business logic and no global subscriptions, so
 * it is cheap to mount many times in a virtualized list.
 */
interface ProductCardProps {
  product: Product;
  /** Fixed width when laid out horizontally; omit for flex grid cells. */
  width?: number;
}

function ProductCardBase({
  product,
  width,
}: ProductCardProps): React.ReactElement {
  const theme = useTheme();
  return (
    <View
      style={[
        styles.card,
        elevation,
        { backgroundColor: theme.surface, borderColor: theme.primary + '1F' },
        width !== undefined ? { width } : styles.flexCell,
      ]}
    >
      <View style={styles.imageWrap}>
        <Image
          source={{ uri: product.imageUrl }}
          style={styles.image}
          contentFit="cover"
          transition={150}
          cachePolicy="memory-disk"
        />
        {product.badge ? (
          <View style={[styles.badge, { backgroundColor: theme.accent }]}>
            <Text style={[styles.badgeText, { color: theme.onPrimary }]}>
              {product.badge}
            </Text>
          </View>
        ) : null}
        {/* ADD / stepper overhangs the image's bottom-right corner. */}
        <View style={styles.addSlot}>
          <QtyStepper productId={product.id} addAction={product.action} />
        </View>
      </View>

      <Text style={[styles.title, { color: theme.text }]} numberOfLines={2}>
        {product.title}
      </Text>

      <PriceTag price={product.price} mrp={product.mrp} />
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: radius.lg,
    padding: spacing.sm,
    paddingBottom: spacing.md,
    gap: spacing.xs,
    borderWidth: 1,
  },
  flexCell: { flex: 1 },
  imageWrap: { position: 'relative', marginBottom: spacing.md },
  image: {
    width: '100%',
    aspectRatio: 1,
    borderRadius: radius.md,
    backgroundColor: '#00000010',
  },
  badge: {
    position: 'absolute',
    top: spacing.sm,
    left: spacing.sm,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: radius.pill,
  },
  badgeText: { ...type.caption, fontSize: 10 },
  addSlot: { position: 'absolute', right: spacing.xs, bottom: -spacing.sm },
  title: { ...type.cardTitle, minHeight: 36 },
});

/**
 * Memoized on product identity. Because the only mutable per-card state lives
 * inside QtyStepper's own subscription, the card body itself never re-renders
 * once mounted — adding to a sibling card cannot touch it.
 */
export const ProductCard = React.memo(ProductCardBase);
