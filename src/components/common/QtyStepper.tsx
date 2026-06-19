import React, { useCallback } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { handleAction } from '@/actions/dispatcher';
import { useCartStore, useItemQuantity } from '@/state/cartStore';
import { useTheme } from '@/theme/ThemeContext';
import { elevation, fonts, radius, spacing } from '@/theme/tokens';
import type { RawAction } from '@/types/schema';

/**
 * Add-to-cart control collocated with a single product.
 *
 * Critically, this component subscribes to ONLY its own quantity slice via
 * `useItemQuantity(productId)`. When the user taps "+", only this stepper (and
 * the header's total counter) re-renders — none of the sibling cards or the
 * other 30+ feed blocks do. That is the local-state-collocation mandate in
 * action.
 *
 * It also stays decoupled from business logic: the "add" path goes through the
 * universal `handleAction` dispatcher using the server-provided action object.
 */
interface QtyStepperProps {
  productId: string;
  /** The raw server action bound to "add" (typically ADD_TO_CART). */
  addAction: RawAction;
}

function QtyStepperBase({
  productId,
  addAction,
}: QtyStepperProps): React.ReactElement {
  const theme = useTheme();
  const qty = useItemQuantity(productId);

  const onAdd = useCallback(() => {
    handleAction(addAction);
  }, [addAction]);

  const onRemove = useCallback(() => {
    useCartStore.getState().remove(productId);
  }, [productId]);

  if (qty === 0) {
    return (
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Add to cart"
        onPress={onAdd}
        style={({ pressed }) => [
          styles.addBtn,
          elevation,
          {
            backgroundColor: theme.surface,
            borderColor: theme.primary,
            opacity: pressed ? 0.7 : 1,
          },
        ]}
      >
        <Text style={[styles.addLabel, { color: theme.primary }]}>ADD</Text>
      </Pressable>
    );
  }

  return (
    <View style={[styles.stepper, elevation, { backgroundColor: theme.primary }]}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Remove one"
        hitSlop={8}
        onPress={onRemove}
      >
        <Text style={[styles.stepGlyph, { color: theme.onPrimary }]}>−</Text>
      </Pressable>
      <Text style={[styles.qty, { color: theme.onPrimary }]}>{qty}</Text>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Add one"
        hitSlop={8}
        onPress={onAdd}
      >
        <Text style={[styles.stepGlyph, { color: theme.onPrimary }]}>+</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  addBtn: {
    borderWidth: 1.5,
    borderRadius: radius.pill,
    paddingHorizontal: spacing.md,
    paddingVertical: 5,
    alignItems: 'center',
    alignSelf: 'flex-start',
  },
  addLabel: { fontFamily: fonts.bodyBold, fontSize: 13, letterSpacing: 1 },
  stepper: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    borderRadius: radius.pill,
    paddingHorizontal: spacing.sm,
    paddingVertical: 3,
    gap: spacing.xs,
  },
  stepGlyph: { fontFamily: fonts.display, fontSize: 18, paddingHorizontal: 4 },
  qty: { fontFamily: fonts.bodyBold, fontSize: 14, minWidth: 16, textAlign: 'center' },
});

/**
 * Memoized. Props (productId + the stable action object) rarely change, so the
 * only thing that re-renders this is its own quantity subscription.
 */
export const QtyStepper = React.memo(QtyStepperBase);
