import { FlashList, type ListRenderItem } from '@shopify/flash-list';
import React, { useCallback, useMemo } from 'react';

import { resolveLayout, type RenderableNode } from '@/components/registry';
import { spacing } from '@/theme/tokens';
import type { RawNode } from '@/types/schema';

/**
 * The single, singular vertical FlashList that streams the entire layout. Every
 * SDUI block in the payload becomes one row here — there is no second vertical
 * scroller. This is what keeps the frame budget predictable: one virtualization
 * boundary, recycled rows, stable keys.
 *
 * Key performance handles:
 *   - `keyExtractor` returns the server-stable node id for precise index
 *     stability across recycles.
 *   - `getItemType` returns the block type so FlashList recycles like-for-like
 *     (a banner cell is never reused as a grid cell), cutting layout churn.
 *   - rows are pre-resolved `React.ReactElement`s wrapped in memo components, so
 *     scrolling never re-validates or re-builds a block.
 */
interface FeedRendererProps {
  layout: readonly RawNode[];
  ListHeaderComponent?: React.ReactElement;
}

function FeedRendererBase({
  layout,
  ListHeaderComponent,
}: FeedRendererProps): React.ReactElement {
  // Resolve + validate once per payload, not per scroll tick.
  const nodes = useMemo<RenderableNode[]>(() => resolveLayout(layout), [layout]);

  const renderItem = useCallback<ListRenderItem<RenderableNode>>(
    ({ item }) => <FeedRow node={item} />,
    [],
  );

  const keyExtractor = useCallback((item: RenderableNode) => item.id, []);
  const getItemType = useCallback((item: RenderableNode) => item.type, []);

  return (
    <FlashList
      data={nodes}
      renderItem={renderItem}
      keyExtractor={keyExtractor}
      getItemType={getItemType}
      ListHeaderComponent={ListHeaderComponent}
      showsVerticalScrollIndicator={false}
      contentContainerStyle={{ paddingBottom: spacing.xxl }}
    />
  );
}

/**
 * A memoized row wrapper. The resolved element identity is stable across
 * scrolls, so this barrier prevents the feed's own re-renders (e.g. a theme
 * swap higher up) from cascading into unrelated rows.
 */
const FeedRow = React.memo(function FeedRow({
  node,
}: {
  node: RenderableNode;
}): React.ReactElement {
  return node.element;
});

export const FeedRenderer = React.memo(FeedRendererBase);
