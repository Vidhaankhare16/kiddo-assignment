import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  Animated,
  Easing,
  LayoutChangeEvent,
  Platform,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import type { ParticleField } from '@/types/schema';

/**
 * A built-in, theme-aware particle overlay.
 *
 * This replaces the heavy full-screen Lottie sheets that used to dominate the
 * whole page for the 'Back to School' and 'Summer' campaigns. Instead a *sparse*
 * handful of motifs (pencils, paper planes, bubbles, …) drift gently across the
 * screen — readable as a festive layer, but never occluding the UI.
 *
 * It is driven entirely by the RN `Animated` API, so it behaves identically on
 * web and native (no Lottie/WebP web-compat caveats). The whole field is
 * `pointerEvents="none"` via its parent overlay, so touches pass straight
 * through to the operational layout underneath.
 */
interface CampaignParticlesProps {
  field: ParticleField;
}

interface Spec {
  key: string;
  motif: string;
  /** Horizontal start position as a fraction of width [0,1]. */
  x: number;
  size: number;
  duration: number;
  delay: number;
  drift: number;
  spin: number;
}

function buildSpecs(field: ParticleField): Spec[] {
  const specs: Spec[] = [];
  for (let i = 0; i < field.count; i++) {
    const motif = field.motifs[i % field.motifs.length] ?? '⭐';
    specs.push({
      key: `p-${i}`,
      motif,
      x: (i + 0.5) / field.count + (Math.random() - 0.5) * 0.06,
      size: 20 + Math.round(Math.random() * 16),
      duration: 5200 + Math.round(Math.random() * 4200),
      delay: Math.round(Math.random() * 4000),
      drift: (Math.random() - 0.5) * 60,
      spin: (Math.random() - 0.5) * 2,
    });
  }
  return specs;
}

function CampaignParticlesBase({
  field,
}: CampaignParticlesProps): React.ReactElement {
  const [box, setBox] = useState({ w: 0, h: 0 });
  const specs = useMemo(() => buildSpecs(field), [field]);

  const onLayout = (e: LayoutChangeEvent): void => {
    const { width, height } = e.nativeEvent.layout;
    setBox({ w: width, h: height });
  };

  return (
    <View style={StyleSheet.absoluteFill} onLayout={onLayout}>
      {box.h > 0
        ? specs.map((s) => (
            <Particle key={s.key} spec={s} box={box} rise={field.rise} />
          ))
        : null}
    </View>
  );
}

function Particle({
  spec,
  box,
  rise,
}: {
  spec: Spec;
  box: { w: number; h: number };
  rise: boolean;
}): React.ReactElement {
  const progress = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.timing(progress, {
        toValue: 1,
        duration: spec.duration,
        delay: spec.delay,
        easing: Easing.linear,
        // Transforms can't use the native driver on web; gate it by platform.
        useNativeDriver: Platform.OS !== 'web',
      }),
    );
    loop.start();
    return () => loop.stop();
  }, [progress, spec.duration, spec.delay]);

  const off = spec.size + 20;
  const from = rise ? box.h + off : -off;
  const to = rise ? -off : box.h + off;

  const translateY = progress.interpolate({
    inputRange: [0, 1],
    outputRange: [from, to],
  });
  const translateX = progress.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [0, spec.drift, 0],
  });
  const rotate = progress.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', `${Math.round(spec.spin * 180)}deg`],
  });
  const opacity = progress.interpolate({
    inputRange: [0, 0.12, 0.88, 1],
    outputRange: [0, 0.95, 0.95, 0],
  });

  const left = Math.max(0, Math.min(box.w - spec.size, spec.x * box.w));

  return (
    <Animated.View
      style={[
        styles.particle,
        { left, opacity, transform: [{ translateY }, { translateX }, { rotate }] },
      ]}
    >
      <Text style={{ fontSize: spec.size }}>{spec.motif}</Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  particle: { position: 'absolute', top: 0 },
});

export const CampaignParticles = React.memo(CampaignParticlesBase);
