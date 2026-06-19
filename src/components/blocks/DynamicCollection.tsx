import { FlashList, type ListRenderItem } from '@shopify/flash-list';
import React, { useCallback } from 'react';
import { StyleSheet, View } from 'react-native';

import { ProductCard } from '@/components/common/ProductCard';
import { SectionHeader } from '@/components/common/SectionHeader';
import { layout, spacing } from '@/theme/tokens';
import type { Product, DynamicCollectionProps } from '@/types/schema';

const CARD_WIDTH = 158;

/**
 * DYNAMIC_COLLECTION — a horizontally scrolling carousel nested deep inside the
 * master vertical feed.
 *
 * Scroll isolation (the core constraint): a horizontal FlashList consumes only
 * horizontal pan gestures, so the parent vertical list keeps its momentum — the
 * gesture systems don't fight. We additionally:
 *   - keep the row a FIXED height (no layout thrash up into the parent),
 *   - let FlashList v2 auto-size + recycle cells so heap stays bounded instead
 *     of mounting every product as the user scrolls heavily.
 */
function DynamicCollectionBase({
  collectionTitle,
  subtitle,
  accent,
  products,
}: DynamicCollectionProps): React.ReactElement {
  const renderItem = useCallback<ListRenderItem<Product>>(
    ({ item }) => <ProductCard product={item} width={CARD_WIDTH} />,
    [],
  );

  const keyExtractor = useCallback((item: Product) => item.id, []);

  return (
    <View style={styles.wrap}>
      <SectionHeader
        title={collectionTitle}
        subtitle={subtitle}
        accent={accent}
      />
      <View style={styles.listHeight}>
        <FlashList
          horizontal
          data={products}
          renderItem={renderItem}
          keyExtractor={keyExtractor}
          showsHorizontalScrollIndicator={false}
          ItemSeparatorComponent={Separator}
          contentContainerStyle={styles.content}
        />
      </View>
    </View>
  );
}

function Separator(): React.ReactElement {
  return <View style={{ width: spacing.md }} />;
}

const styles = StyleSheet.create({
  wrap: { marginBottom: spacing.xl },
  // Fixed height keeps the carousel from reflowing the vertical feed.
  listHeight: { height: 264 },
  content: { paddingHorizontal: layout.gutter, paddingVertical: spacing.xs },
});

export const DynamicCollection = React.memo(DynamicCollectionBase);
