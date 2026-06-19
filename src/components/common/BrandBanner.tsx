import { Image } from 'expo-image';
import React from 'react';
import { StyleSheet, View } from 'react-native';

import { elevation, layout, radius, spacing } from '@/theme/tokens';

const LOGO = require('../../../assets/kiddo-logo.png');

/**
 * Full-width Kiddo brand banner. Features the real logo art (wordmark + "the
 * best for your kiddo · delivered in minutes") on a clean card, given the room
 * the wide 5:1 banner needs to read well — the brand stays constant across every
 * campaign skin while the surrounding UI repaints.
 */
function BrandBannerBase(): React.ReactElement {
  return (
    <View style={styles.wrap}>
      <View style={[styles.card, elevation]}>
        {/* The source art is a wide 5:1 banner with empty cream margins and
            rainbow corners. We frame the card a little shorter than the art and
            use `cover` + center so the view zooms into the wordmark lockup,
            trimming the dead top/bottom bands and the corner decorations. */}
        <Image
          source={LOGO}
          style={styles.logo}
          contentFit="cover"
          contentPosition="center"
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { paddingHorizontal: layout.gutter, paddingTop: spacing.md },
  card: {
    backgroundColor: '#FFFDF8',
    borderRadius: radius.lg,
    overflow: 'hidden',
    // Shorter than the art's ~5:1 ratio, so `cover` crops top & bottom and the
    // wordmark reads larger. Lower the divisor for a tighter zoom.
    aspectRatio: 895 / 132,
  },
  logo: { width: '100%', height: '100%' },
});

export const BrandBanner = React.memo(BrandBannerBase);
