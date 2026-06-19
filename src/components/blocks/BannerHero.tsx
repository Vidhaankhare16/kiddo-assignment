import { Image } from 'expo-image';
import React, { useCallback } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { handleAction } from '@/actions/dispatcher';
import { useTheme } from '@/theme/ThemeContext';
import { elevation, fonts, layout, radius, spacing, type } from '@/theme/tokens';
import type { BannerHeroProps } from '@/types/schema';

/**
 * BANNER_HERO — a fluid, full-width promotional card for heroic marketing focus.
 * Tapping anywhere fires its bound action through the universal dispatcher.
 */
function BannerHeroBase(props: BannerHeroProps): React.ReactElement {
  const theme = useTheme();
  const { title, subtitle, imageUrl, ctaLabel, action } = props;

  const onPress = useCallback(() => handleAction(action), [action]);

  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => [styles.wrap, { opacity: pressed ? 0.96 : 1 }]}
    >
      <View style={[styles.card, elevation]}>
        <Image
          source={{ uri: imageUrl }}
          style={StyleSheet.absoluteFill}
          contentFit="cover"
          transition={200}
          cachePolicy="memory-disk"
        />
        {/* Scrim for legible text over arbitrary imagery. */}
        <View style={styles.scrim} />
        {/* A playful Kiddo sparkle in the corner. */}
        <Text style={styles.sparkle}>✦</Text>
        <View style={styles.content}>
          <Text style={styles.title} numberOfLines={2}>
            {title}
          </Text>
          {subtitle ? (
            <Text style={styles.subtitle} numberOfLines={2}>
              {subtitle}
            </Text>
          ) : null}
          {ctaLabel ? (
            <View style={[styles.cta, { backgroundColor: theme.primary }]}>
              <Text style={[styles.ctaText, { color: theme.onPrimary }]}>
                {ctaLabel}
              </Text>
              <Text style={[styles.ctaArrow, { color: theme.onPrimary }]}>›</Text>
            </View>
          ) : null}
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  wrap: { paddingHorizontal: layout.gutter, marginBottom: spacing.xl },
  card: {
    height: 184,
    borderRadius: radius.xl,
    overflow: 'hidden',
    justifyContent: 'flex-end',
    backgroundColor: '#ddd',
  },
  scrim: { ...StyleSheet.absoluteFillObject, backgroundColor: '#00000047' },
  sparkle: {
    position: 'absolute',
    top: spacing.md,
    right: spacing.lg,
    color: '#FFFFFFCC',
    fontSize: 18,
  },
  content: { padding: spacing.lg, gap: spacing.xs },
  title: { ...type.hero, color: '#FFFFFF' },
  subtitle: { ...type.body, color: '#FFFFFFE6' },
  cta: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    gap: 2,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: radius.pill,
    marginTop: spacing.sm,
  },
  ctaText: { fontFamily: fonts.bodyBold, fontSize: 14 },
  ctaArrow: { fontFamily: fonts.display, fontSize: 18, marginTop: -2 },
});

export const BannerHero = React.memo(BannerHeroBase);
