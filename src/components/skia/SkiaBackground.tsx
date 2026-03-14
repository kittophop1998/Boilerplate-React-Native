// ─── SkiaBackground ─────────────────────────────────────────────────────────
// Full-screen animated gradient background with floating orbs/particles.
// Drop this at the root of any screen to give it a living, breathing backdrop.
//
// Usage:
//   <SkiaBackground>
//     <YourScreenContent />
//   </SkiaBackground>
// ─────────────────────────────────────────────────────────────────────────────
import React, { useEffect } from 'react';
import { Dimensions, StyleSheet, View } from 'react-native';
import {
  Canvas,
  Circle,
  LinearGradient,
  RadialGradient,
  Rect,
  vec,
  BlurMask,
} from '@shopify/react-native-skia';
import {
  useSharedValue,
  withRepeat,
  withTiming,
  Easing,
  useDerivedValue,
} from 'react-native-reanimated';
import { Colors } from '@theme/index';

const { width: SW, height: SH } = Dimensions.get('window');

// ── Orb definitions ──────────────────────────────────────────────────────────
const ORBS = [
  { cx: SW * 0.15, cy: SH * 0.12, r: 90,  color: 'rgba(93,63,211,0.45)',   driftX: 18, driftY: 24, speed: 4200 },
  { cx: SW * 0.82, cy: SH * 0.08, r: 70,  color: 'rgba(255,217,61,0.18)',  driftX: -14, driftY: 20, speed: 5100 },
  { cx: SW * 0.55, cy: SH * 0.45, r: 110, color: 'rgba(77,150,255,0.18)', driftX: 12, driftY: -18, speed: 6000 },
  { cx: SW * 0.10, cy: SH * 0.68, r: 80,  color: 'rgba(255,107,107,0.15)', driftX: 20, driftY: -10, speed: 4800 },
  { cx: SW * 0.75, cy: SH * 0.80, r: 95,  color: 'rgba(107,203,119,0.14)', driftX: -10, driftY: 16, speed: 5500 },
  { cx: SW * 0.40, cy: SH * 0.90, r: 60,  color: 'rgba(180,60,255,0.20)',  driftX: 8, driftY: -22, speed: 3800 },
] as const;

// ── Single animated orb ──────────────────────────────────────────────────────
function AnimatedOrb({
  cx, cy, r, color, driftX, driftY, speed,
}: {
  cx: number; cy: number; r: number; color: string;
  driftX: number; driftY: number; speed: number;
}) {
  const progress = useSharedValue(0);

  useEffect(() => {
    progress.value = withRepeat(
      withTiming(1, { duration: speed, easing: Easing.inOut(Easing.sin) }),
      -1,
      true,
    );
  }, [progress, speed]);

  const animCx = useDerivedValue(() => cx + driftX * progress.value);
  const animCy = useDerivedValue(() => cy + driftY * progress.value);

  return (
    <Circle cx={animCx} cy={animCy} r={r} color={color}>
      <BlurMask blur={r * 0.7} style="normal" respectCTM />
    </Circle>
  );
}

// ── Props ────────────────────────────────────────────────────────────────────
interface Props {
  children?: React.ReactNode;
  /** Override the top gradient stop (default: Colors.background) */
  colorTop?: string;
  /** Override the bottom gradient stop (default: Colors.tabBarBg) */
  colorBottom?: string;
  /** Show extra shimmer orb in the center (default: true) */
  showCenterGlow?: boolean;
}

// ─────────────────────────────────────────────────────────────────────────────
export default function SkiaBackground({
  children,
  colorTop = Colors.background,
  colorBottom = Colors.tabBarBg,
  showCenterGlow = true,
}: Props) {
  return (
    <View style={StyleSheet.absoluteFill}>
      {/* Skia canvas — sits behind all content */}
      <Canvas style={StyleSheet.absoluteFill} pointerEvents="none">

        {/* Base gradient */}
        <Rect x={0} y={0} width={SW} height={SH}>
          <LinearGradient
            start={vec(SW * 0.5, 0)}
            end={vec(SW * 0.5, SH)}
            colors={[colorTop, colorBottom]}
          />
        </Rect>

        {/* Center radial glow */}
        {showCenterGlow && (
          <Rect x={0} y={0} width={SW} height={SH}>
            <RadialGradient
              c={vec(SW * 0.5, SH * 0.35)}
              r={SW * 0.75}
              colors={['rgba(122,95,224,0.35)', 'transparent']}
            />
          </Rect>
        )}

        {/* Floating orbs */}
        {ORBS.map((o, i) => (
          <AnimatedOrb key={i} {...o} />
        ))}
      </Canvas>

      {/* Screen content rendered on top */}
      {children}
    </View>
  );
}
