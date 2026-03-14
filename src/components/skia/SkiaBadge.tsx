// ─── SkiaBadge ───────────────────────────────────────────────────────────────
// Pill / badge with animated neon-border glow.
// Great for: rarity labels, status pills ("ONLINE"), stat chips, coin badges.
//
// Usage:
//   <SkiaBadge label="ONLINE" color={Colors.shareGreen} />
//   <SkiaBadge label="💰 1,200" color={Colors.gold} textColor={Colors.background} />
//   <SkiaBadge label="SR" color={Colors.stealRed} animated={false} />
// ─────────────────────────────────────────────────────────────────────────────
import React, { useEffect } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import {
  Canvas,
  RoundedRect,
  BlurMask,
} from '@shopify/react-native-skia';
import {
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import { Colors, FontSize, FontWeight, Radius } from '@theme/index';

// ─────────────────────────────────────────────────────────────────────────────
interface Props {
  label: string;
  color?: string;
  textColor?: string;
  fontSize?: number;
  paddingH?: number;
  paddingV?: number;
  borderRadius?: number;
  /** Animate glow pulse */
  animated?: boolean;
}

export default function SkiaBadge({
  label,
  color = Colors.gold,
  textColor = Colors.background,
  fontSize = FontSize.xs,
  paddingH = 10,
  paddingV = 4,
  borderRadius = Radius.full,
  animated = true,
}: Props) {
  // Measure approximate pill size (no layout engine at draw time)
  // We render text first, canvas on top (absoluteFill) so pill self-sizes.
  const glowOpacity = useSharedValue(0.5);

  useEffect(() => {
    if (!animated) { return; }
    glowOpacity.value = withRepeat(
      withSequence(
        withTiming(1, { duration: 800, easing: Easing.inOut(Easing.sin) }),
        withTiming(0.3, { duration: 800, easing: Easing.inOut(Easing.sin) }),
      ),
      -1,
      false,
    );
  }, [glowOpacity, animated]);

  // Pass shared value directly — Skia's Reanimated bridge reads it

  return (
    <View
      style={[
        styles.pill,
        {
          backgroundColor: `${color}22`, // very light fill tint
          borderColor: color,
          borderRadius,
          paddingHorizontal: paddingH,
          paddingVertical: paddingV,
        },
      ]}
    >
      {/* Skia glow halo — drawn behind text */}
      <Canvas style={StyleSheet.absoluteFill} pointerEvents="none">
        <RoundedRect
          x={0} y={0}
          // canvas fills the view, so width/height will be whatever the view is
          width={999} height={999}
          r={borderRadius}
          color={color}
          opacity={0.25}
        >
          <BlurMask blur={8} style="outer" respectCTM />
        </RoundedRect>
      </Canvas>

      <Text
        style={[
          styles.text,
          { color: textColor, fontSize },
        ]}
      >
        {label}
      </Text>
    </View>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  pill: {
    alignSelf: 'flex-start',
    borderWidth: 1,
    overflow: 'hidden',
  },
  text: {
    fontWeight: FontWeight.bold,
    letterSpacing: 0.8,
    textAlign: 'center',
  },
});
