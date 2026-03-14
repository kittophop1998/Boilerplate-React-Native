// ─── SkiaAvatarRing ───────────────────────────────────────────────────────────
// Circular avatar container with a continuously rotating rainbow-gradient ring
// and an optional pulsing outer glow halo.
//
// Usage:
//   <SkiaAvatarRing size={130} glowColor={Colors.goldGlow}>
//     <Text style={{ fontSize: 56 }}>🦊</Text>
//   </SkiaAvatarRing>
// ─────────────────────────────────────────────────────────────────────────────
import React, { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import {
  Canvas,
  Circle,
  LinearGradient,
  vec,
  BlurMask,
  Group,
  Skia,
} from '@shopify/react-native-skia';
import {
  useSharedValue,
  withRepeat,
  withTiming,
  withSequence,
  Easing,
  useDerivedValue,
} from 'react-native-reanimated';
import { Colors } from '@theme/index';

// ─────────────────────────────────────────────────────────────────────────────
interface Props {
  children?: React.ReactNode;
  /** Outer diameter of the whole ring widget */
  size?: number;
  /** Ring stroke width */
  ringWidth?: number;
  /** Pulse the outer halo */
  pulseGlow?: boolean;
  /** Glow color */
  glowColor?: string;
  /** Inner circle fill (avatar background) */
  innerColor?: string;
}

export default function SkiaAvatarRing({
  children,
  size = 130,
  ringWidth = 3,
  pulseGlow = true,
  glowColor = Colors.goldGlow,
  innerColor = Colors.cardGlass,
}: Props) {
  const cx = size / 2;
  const cy = size / 2;
  const outerR = size / 2 - 1;
  const innerR = outerR - ringWidth - 2;

  // ── Rotate gradient ──────────────────────────────────────────────────────
  const angle = useSharedValue(0);
  useEffect(() => {
    angle.value = withRepeat(
      withTiming(Math.PI * 2, { duration: 3000, easing: Easing.linear }),
      -1,
      false,
    );
  }, [angle]);

  const gradStart = useDerivedValue(() =>
    vec(cx + Math.cos(angle.value) * outerR, cy + Math.sin(angle.value) * outerR),
  );
  const gradEnd = useDerivedValue(() =>
    vec(cx - Math.cos(angle.value) * outerR, cy - Math.sin(angle.value) * outerR),
  );

  // ── Pulse glow ───────────────────────────────────────────────────────────
  const glowRadius = useSharedValue(outerR + 6);
  useEffect(() => {
    if (!pulseGlow) { return; }
    glowRadius.value = withRepeat(
      withSequence(
        withTiming(outerR + 14, { duration: 1000, easing: Easing.inOut(Easing.sin) }),
        withTiming(outerR + 4, { duration: 1000, easing: Easing.inOut(Easing.sin) }),
      ),
      -1,
      false,
    );
  }, [glowRadius, outerR, pulseGlow]);

  // Build circular clip path for the inner avatar region
  const clipPath = Skia.Path.Make();
  clipPath.addCircle(cx, cy, innerR);

  return (
    <View style={{ width: size, height: size }}>
      <Canvas style={StyleSheet.absoluteFill} pointerEvents="none">
        {/* Outer pulsing glow halo */}
        {pulseGlow && (
          <Circle cx={cx} cy={cy} r={glowRadius} color={glowColor}>
            <BlurMask blur={12} style="outer" respectCTM />
          </Circle>
        )}

        {/* Ring stroke with rotating gradient */}
        <Circle cx={cx} cy={cy} r={outerR} style="stroke" strokeWidth={ringWidth} color="transparent">
          <LinearGradient
            start={gradStart}
            end={gradEnd}
            colors={[
              Colors.gold,
              Colors.shieldBlue,
              Colors.shareGreen,
              Colors.stealRed,
              Colors.gold,
            ]}
          />
        </Circle>

        {/* Inner circle fill */}
        <Group clip={clipPath}>
          <Circle cx={cx} cy={cy} r={innerR} color={innerColor} />
        </Group>
      </Canvas>

      {/* Content centered inside the inner circle */}
      <View
        style={[
          StyleSheet.absoluteFill,
          styles.content,
          { borderRadius: innerR, margin: ringWidth + 3 },
        ]}
      >
        {children}
      </View>
    </View>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  content: {
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
});
