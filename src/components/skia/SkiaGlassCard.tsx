// ─── SkiaGlassCard ───────────────────────────────────────────────────────────
// Glassmorphism card surface rendered entirely in Skia:
//  • Frosted white fill (rgba)
//  • Animated rainbow / lavender border that rotates its gradient
//  • Soft inner shadow + outer glow
//  • Accepts any React children as content
//
// Usage:
//   <SkiaGlassCard width={340} height={160}>
//     <Text style={{ color: '#fff' }}>Hello</Text>
//   </SkiaGlassCard>
//
//   // Disable animated border:
//   <SkiaGlassCard animateBorder={false} borderColor={Colors.lavenderBorder}>
//
//   // Dynamic height (auto-size to children):
//   <SkiaGlassCard width={340}>
//     <Text>Content</Text>
//   </SkiaGlassCard>
// ─────────────────────────────────────────────────────────────────────────────
import React, { useEffect, useState } from 'react';
import { StyleSheet, View, ViewStyle, LayoutChangeEvent } from 'react-native';
import {
  Canvas,
  RoundedRect,
  LinearGradient,
  vec,
  BlurMask,
  Skia,
  Group,
} from '@shopify/react-native-skia';
import {
  useSharedValue,
  withRepeat,
  withTiming,
  Easing,
  useDerivedValue,
} from 'react-native-reanimated';
import { Colors, Radius } from '@theme/index';

// ─────────────────────────────────────────────────────────────────────────────
interface Props {
  children?: React.ReactNode;
  width: number;
  /** Fixed height. If omitted the card sizes itself to its children. */
  height?: number;
  borderRadius?: number;
  /** Solid fill color of the glass surface */
  fillColor?: string;
  /** Static border color (used when animateBorder=false) */
  borderColor?: string;
  borderWidth?: number;
  /** Rotate the border gradient for a holographic shimmer */
  animateBorder?: boolean;
  /** Outer glow color */
  glowColor?: string;
  /** Extra style applied to the outer View wrapper */
  style?: ViewStyle;
}

export default function SkiaGlassCard({
  children,
  width,
  height: heightProp,
  borderRadius = Radius.md,
  fillColor = Colors.cardGlass,
  borderColor = Colors.cardGlassBorder,
  borderWidth = 1.5,
  animateBorder = true,
  glowColor = 'rgba(122,95,224,0.28)',
  style,
}: Props) {
  const [measuredHeight, setMeasuredHeight] = useState(heightProp ?? 0);
  const height = heightProp ?? measuredHeight;

  const onLayout = (e: LayoutChangeEvent) => {
    if (!heightProp) {
      setMeasuredHeight(e.nativeEvent.layout.height);
    }
  };

  // Gradient angle rotation  0 → 2π
  const angle = useSharedValue(0);

  useEffect(() => {
    if (!animateBorder) { return; }
    angle.value = withRepeat(
      withTiming(Math.PI * 2, { duration: 4000, easing: Easing.linear }),
      -1,
      false,
    );
  }, [angle, animateBorder]);

  // Compute rotating start / end vectors from angle
  const gradStart = useDerivedValue(() => {
    const cx = width / 2;
    const cy = height / 2;
    const r = Math.max(width, height) * 0.6;
    return vec(
      cx + Math.cos(angle.value) * r,
      cy + Math.sin(angle.value) * r,
    );
  });
  const gradEnd = useDerivedValue(() => {
    const cx = width / 2;
    const cy = height / 2;
    const r = Math.max(width, height) * 0.6;
    return vec(
      cx - Math.cos(angle.value) * r,
      cy - Math.sin(angle.value) * r,
    );
  });

  // Clip to rounded rect
  const clipRRect = Skia.RRectXY(
    Skia.XYWHRect(0, 0, width, height),
    borderRadius,
    borderRadius,
  );

  return (
    <View
      style={[cardStyles.card, { width, ...(heightProp ? { height } : {}) }, style]}
      onLayout={onLayout}
    >
      {/* Skia layer — rendered only when we have a real height */}
      {height > 0 && (
        <Canvas
          style={[StyleSheet.absoluteFill, { width, height }]}
          pointerEvents="none"
        >
        {/* Outer glow halo */}
        <RoundedRect
          x={-4} y={-4}
          width={width + 8} height={height + 8}
          r={borderRadius + 4}
          color={glowColor}
        >
          <BlurMask blur={12} style="outer" respectCTM />
        </RoundedRect>

        {/* Glass fill */}
        <Group clip={clipRRect}>
          <RoundedRect
            x={0} y={0}
            width={width} height={height}
            r={borderRadius}
            color={fillColor}
          />

          {/* Top highlight sweep */}
          <RoundedRect x={0} y={0} width={width} height={height * 0.45} r={borderRadius} color="transparent">
            <LinearGradient
              start={vec(0, 0)}
              end={vec(0, height * 0.45)}
              colors={['rgba(255,255,255,0.10)', 'transparent']}
            />
          </RoundedRect>
        </Group>

        {/* Animated / static border */}
        <RoundedRect
          x={borderWidth / 2}
          y={borderWidth / 2}
          width={width - borderWidth}
          height={height - borderWidth}
          r={borderRadius - borderWidth / 2}
          style="stroke"
          strokeWidth={borderWidth}
          color={animateBorder ? 'transparent' : borderColor}
        >
          {animateBorder && (
            <LinearGradient
              start={gradStart}
              end={gradEnd}
              colors={[
                'rgba(255,217,61,0.85)',
                'rgba(200,180,255,0.70)',
                'rgba(77,150,255,0.70)',
                'rgba(255,107,107,0.55)',
                'rgba(255,217,61,0.85)',
              ]}
            />
          )}
        </RoundedRect>
        </Canvas>
      )}

      {/* Content */}
      {children}
    </View>
  );
}

const cardStyles = StyleSheet.create({
  card: { overflow: 'hidden' },
});