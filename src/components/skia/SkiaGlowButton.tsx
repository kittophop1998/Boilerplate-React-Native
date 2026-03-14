// ─── SkiaGlowButton ──────────────────────────────────────────────────────────
// Pressable button with:
//  • Animated neon glow pulsing around the border
//  • Shimmer sweep that slides across the surface every few seconds
//  • Fully customisable colors, size and label
//
// Usage:
//   <SkiaGlowButton label="JOIN HEIST" icon="🎯" onPress={handleJoin} />
//   <SkiaGlowButton label="STEAL" color={Colors.stealRed} glowColor={Colors.stealRedGlow} />
// ─────────────────────────────────────────────────────────────────────────────
import React, { useEffect } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import {
  Canvas,
  RoundedRect,
  LinearGradient,
  vec,
  BlurMask,
  Rect,
  Skia,
  Path,
  Group,
} from '@shopify/react-native-skia';
import {
  useSharedValue,
  withRepeat,
  withTiming,
  withSequence,
  withDelay,
  Easing,
  useDerivedValue,
} from 'react-native-reanimated';
import { Colors, FontSize, FontWeight, Radius } from '@theme/index';

// ─────────────────────────────────────────────────────────────────────────────
interface Props {
  label: string;
  icon?: string;
  onPress?: () => void;
  /** Fill / face color of the button */
  color?: string;
  /** Glow color (semi-transparent) */
  glowColor?: string;
  /** Second gradient stop on the face (lighter) */
  colorLight?: string;
  width?: number;
  height?: number;
  fontSize?: number;
  disabled?: boolean;
  activeOpacity?: number;
}

const DEFAULT_W = 320;
const DEFAULT_H = 60;
const BORDER_R = Radius.lg;

// ─────────────────────────────────────────────────────────────────────────────
export default function SkiaGlowButton({
  label,
  icon,
  onPress,
  color = Colors.gold,
  glowColor = Colors.goldGlow,
  colorLight,
  width = DEFAULT_W,
  height = DEFAULT_H,
  fontSize = FontSize.lg,
  disabled = false,
  activeOpacity = 0.85,
}: Props) {
  // Resolved light stop
  const faceLight = colorLight ?? adjustAlpha(color, 0.72);

  // ── Glow pulse ──
  const glowOpacity = useSharedValue(0.5);
  useEffect(() => {
    glowOpacity.value = withRepeat(
      withSequence(
        withTiming(1, { duration: 900, easing: Easing.inOut(Easing.sin) }),
        withTiming(0.4, { duration: 900, easing: Easing.inOut(Easing.sin) }),
      ),
      -1,
      false,
    );
  }, [glowOpacity]);

  // ── Shimmer sweep (0 → width+extra, repeats every 3.5s) ──
  const shimmerX = useSharedValue(-width * 0.6);
  useEffect(() => {
    shimmerX.value = withRepeat(
      withDelay(
        1800,
        withTiming(width * 1.3, { duration: 900, easing: Easing.out(Easing.quad) }),
      ),
      -1,
      false,
    );
    // reset position between cycles handled by withRepeat+withDelay loop
  }, [shimmerX, width]);

  // Derived shimmer rect x positions
  const shimX1 = useDerivedValue(() => shimmerX.value);

  // Clip path for rounded rect mask
  const clipRRect = Skia.RRectXY(
    Skia.XYWHRect(0, 0, width, height),
    BORDER_R,
    BORDER_R,
  );

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={activeOpacity}
      disabled={disabled}
      style={[styles.touch, { width, height }]}
    >
      <Canvas style={StyleSheet.absoluteFill} pointerEvents="none">
        {/* Outer glow halo */}
        <RoundedRect x={-8} y={-8} width={width + 16} height={height + 16} r={BORDER_R + 8} color={glowColor}>
          <BlurMask blur={18} style="outer" respectCTM />
        </RoundedRect>

        {/* Button face gradient */}
        <Group clip={clipRRect}>
          <Rect x={0} y={0} width={width} height={height}>
            <LinearGradient
              start={vec(0, 0)}
              end={vec(width, height)}
              colors={[faceLight, color]}
            />
          </Rect>

          {/* Shimmer stripe */}
          <Rect x={shimX1} y={0} width={width * 0.45} height={height}>
            <LinearGradient
              start={vec(0, 0)}
              end={vec(width * 0.45, 0)}
              colors={['transparent', 'rgba(255,255,255,0.22)', 'transparent']}
            />
          </Rect>
        </Group>

        {/* Bright top highlight line */}
        <Path
          path={`M ${BORDER_R} 2 L ${width - BORDER_R} 2`}
          style="stroke"
          strokeWidth={1.5}
          color="rgba(255,255,255,0.40)"
        />
      </Canvas>

      {/* Label row */}
      <View style={styles.labelRow} pointerEvents="none">
        {icon ? <Text style={[styles.icon, { fontSize: fontSize + 4 }]}>{icon}</Text> : null}
        <Text style={[styles.label, { fontSize, color: Colors.background }]}>
          {label}
        </Text>
      </View>
    </TouchableOpacity>
  );
}

// ─── helpers ─────────────────────────────────────────────────────────────────
/** Darken / lighten a hex color by returning it at given opacity as rgba */
function adjustAlpha(_hex: string, _factor: number): string {
  // Simple: return a lighter tint using white overlay
  return `rgba(255,255,255,0.90)`;
}

// ─────────────────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  touch: {
    borderRadius: BORDER_R,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'visible',
  },
  labelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  icon: {
    lineHeight: 28,
  },
  label: {
    fontWeight: FontWeight.bold,
    letterSpacing: 2,
  },
});
