import React from 'react';
import { StyleSheet, View } from 'react-native';

import { ProductCard } from '@/components/common/ProductCard';
import { SectionHeader } from '@/components/common/SectionHeader';
import { layout, spacing } from '@/theme/tokens';
import type { ProductGrid2x2Props } from '@/types/schema';

/**
 * PRODUCT_GRID_2X2 — a balanced 2x2 grid of product tiles. We render at most 4
 * items (two rows of two) and lay them out with fl: a fixed-count grid does not
 * need its own virtualization, and nesting a scrollable list here would fight
 * the master vertical list.
 */
function ProductGrid2x2Base({
  title,
  products,
}: ProductGrid2x2Props): React.ReactElement {
  const items = products.slice(0, 4);
  const rows: (typeof items)[] = [items.slice(0, 2), items.slice(2, 4)];

  return (
    <View style={styles.wrap}>
      {title ? <SectionHeader title={title} /> : null}
      <View style={styles.grid}>
        {rows.map((row, rowIdx) => (
          <View key={`row-${rowIdx}`} style={styles.row}>
            {row.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
            {/* Keep the last row balanced if it has a single item. */}
            {row.length === 1 ? <View style={styles.spacer} /> : null}
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { marginBottom: spacing.xl },
  grid: { paddingHorizontal: layout.gutter, gap: spacing.lg },
  row: { flexDirection: 'row', gap: spacing.md, alignItems: 'flex-start' },
  spacer: { flex: 1 },
});

export const ProductGrid2x2 = React.memo(ProductGrid2x2Base);
