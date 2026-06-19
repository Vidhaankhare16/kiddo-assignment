import { Image } from 'expo-image';
import LottieView, { type LottieViewProps } from 'lottie-react-native';
import React from 'react';
import { StyleSheet, View } from 'react-native';

import { CampaignParticles } from '@/components/overlay/CampaignParticles';
import type { FullScreenOverlay } from '@/types/schema';

/**
 * FULL_SCREEN_OVERLAY engine.
 *
 * Renders the active campaign's animation over the entire interactive surface
 * while leaving the app fully usable underneath:
 *   - the wrapper is absolutely filled and sits above the feed, but
 *   - `pointerEvents="none"` is applied on the wrapper so every touch passes
 *     straight through to the operational layout — no input occlusion.
 *
 * Three resolvable kinds:
 *   - `particles`: a sparse, theme-aware native particle field (used for the
 *     'Back to School' and 'Summer' campaigns). Tasteful by design and identical
 *     on web + native.
 *   - `lottie`: a Lottie JSON animation (used for 'Mystery Gift Carnival'
 *     confetti). On web, lottie-react-native needs `webStyle` for sizing — we
 *     pass both `style` and `webStyle` so it fills correctly everywhere.
 *   - `webp`: an animated WebP/GIF served through the `expo-image` memory+disk
 *     cache, so remote campaign media is fetched once and reused.
 */
interface CampaignOverlayProps {
  overlay: FullScreenOverlay;
}

function CampaignOverlayBase({
  overlay,
}: CampaignOverlayProps): React.ReactElement {
  return (
    <View style={styles.fill} pointerEvents="none">
      <OverlayContent overlay={overlay} />
    </View>
  );
}

function OverlayContent({
  overlay,
}: CampaignOverlayProps): React.ReactElement | null {
  if (overlay.kind === 'particles') {
    return overlay.particles ? (
      <CampaignParticles field={overlay.particles} />
    ) : null;
  }

  if (overlay.kind === 'lottie') {
    // Prefer a bundled asset when present (reliable offline demo); otherwise
    // stream + cache the remote URL.
    const lottieSource = (overlay.localAsset ?? {
      uri: overlay.animation_url,
    }) as LottieViewProps['source'];

    return (
      <LottieView
        source={lottieSource}
        autoPlay
        loop
        resizeMode="cover"
        style={styles.fill}
        // web (dotlottie) sizes via webStyle (CSS), not style.
        webStyle={{ width: '100%', height: '100%' }}
      />
    );
  }

  // `webp` — animated WebP/GIF through the image cache pipeline.
  return (
    <Image
      source={{ uri: overlay.animation_url }}
      style={styles.fill}
      contentFit="cover"
      cachePolicy="memory-disk"
    />
  );
}

const styles = StyleSheet.create({
  fill: { ...StyleSheet.absoluteFillObject },
});

export const CampaignOverlay = React.memo(CampaignOverlayBase);
