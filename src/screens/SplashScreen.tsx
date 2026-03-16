// ─── SplashScreen ─────────────────────────────────────────────────────────────
// Shown once on app launch before entering the main app.
// Fades in the logo + title, holds for a moment, then fades out and calls onDone.
// ─────────────────────────────────────────────────────────────────────────────
import React, { useEffect, useRef } from 'react';
import {
  Animated,
  Dimensions,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import {
  Canvas,
  LinearGradient,
  Rect,
  Circle,
  BlurMask,
  vec,
} from '@shopify/react-native-skia';
import {
  useSharedValue,
  withRepeat,
  withTiming,
  Easing,
  useDerivedValue,
} from 'react-native-reanimated';
import { Colors, FontSize, FontWeight } from '@theme/index';

const { width: SW, height: SH } = Dimensions.get('window');

// ── Timings ───────────────────────────────────────────────────────────────────
const FADE_IN_MS  = 900;   // logo + title fade in
const HOLD_MS     = 1800;  // how long splash stays visible after fade-in
const FADE_OUT_MS = 700;   // fade out before navigating

// ── Props ─────────────────────────────────────────────────────────────────────
interface Props {
  /** Called when the splash animation finishes — navigate away. */
  onDone: () => void;
}

// ─────────────────────────────────────────────────────────────────────────────
export default function SplashScreen({ onDone }: Props) {
  // ── Animated values ────────────────────────────────────────────────────────
  const screenOpacity  = useRef(new Animated.Value(1)).current;  // whole screen
  const contentOpacity = useRef(new Animated.Value(0)).current;  // logo + text
  const contentScale   = useRef(new Animated.Value(0.82)).current;

  // ── Skia orb pulse ─────────────────────────────────────────────────────────
  const pulse = useSharedValue(0);
  useEffect(() => {
    pulse.value = withRepeat(
      withTiming(1, { duration: 2400, easing: Easing.inOut(Easing.sin) }),
      -1,
      true,
    );
  }, [pulse]);
  const orbR1 = useDerivedValue(() => 120 + 20 * pulse.value);
  const orbR2 = useDerivedValue(() => 80  + 14 * pulse.value);

  // ── Sequence: fade-in → hold → fade-out → onDone ──────────────────────────
  useEffect(() => {
    Animated.sequence([
      // 1. Content fades / scales in
      Animated.parallel([
        Animated.timing(contentOpacity, {
          toValue: 1,
          duration: FADE_IN_MS,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
        Animated.spring(contentScale, {
          toValue: 1,
          friction: 6,
          tension: 60,
          useNativeDriver: true,
        }),
      ]),
      // 2. Hold visible
      Animated.delay(HOLD_MS),
      // 3. Whole screen fades out
      Animated.timing(screenOpacity, {
        toValue: 0,
        duration: FADE_OUT_MS,
        easing: Easing.in(Easing.cubic),
        useNativeDriver: true,
      }),
    ]).start(() => onDone());
  }, [contentOpacity, contentScale, onDone, screenOpacity]);

  // ─────────────────────────────────────────────────────────────────────────
  return (
    <Animated.View style={[styles.root, { opacity: screenOpacity }]}>
      {/* ── Skia gradient background ── */}
      <Canvas style={StyleSheet.absoluteFill}>
        {/* base gradient */}
        <Rect x={0} y={0} width={SW} height={SH}>
          <LinearGradient
            start={vec(SW * 0.5, 0)}
            end={vec(SW * 0.5, SH)}
            colors={['#3D2575', Colors.background, Colors.tabBarBg]}
          />
        </Rect>

        {/* glow orbs */}
        <Circle cx={SW * 0.18} cy={SH * 0.20} r={orbR1} color="rgba(93,63,211,0.38)">
          <BlurMask blur={80} style="normal" respectCTM />
        </Circle>
        <Circle cx={SW * 0.80} cy={SH * 0.75} r={orbR2} color="rgba(255,210,63,0.28)">
          <BlurMask blur={60} style="normal" respectCTM />
        </Circle>
        <Circle cx={SW * 0.60} cy={SH * 0.35} r={70} color="rgba(81,229,255,0.14)">
          <BlurMask blur={50} style="normal" respectCTM />
        </Circle>
      </Canvas>

      {/* ── Animated content ── */}
      <Animated.View
        style={[
          styles.content,
          { opacity: contentOpacity, transform: [{ scale: contentScale }] },
        ]}
      >
        {/* Logo badge */}
        <View style={styles.logoBadge}>
          <Text style={styles.logoEmoji}>🏴‍☠️</Text>
        </View>

        {/* App name */}
        <Text style={styles.title}>GREEDY GANG</Text>

        {/* Tagline */}
        <Text style={styles.tagline}>The Heist Begins.</Text>

        {/* Decorative divider */}
        <View style={styles.divider} />

        {/* Loading dots */}
        <LoadingDots />
      </Animated.View>
    </Animated.View>
  );
}

// ── Simple animated loading dots ──────────────────────────────────────────────
function LoadingDots() {
  const anim0 = useRef(new Animated.Value(0.3)).current;
  const anim1 = useRef(new Animated.Value(0.3)).current;
  const anim2 = useRef(new Animated.Value(0.3)).current;
  const anims = [anim0, anim1, anim2];

  useEffect(() => {
    const animations = anims.map((anim, i) =>
      Animated.loop(
        Animated.sequence([
          Animated.delay(i * 220),
          Animated.timing(anim, {
            toValue: 1,
            duration: 380,
            useNativeDriver: true,
          }),
          Animated.timing(anim, {
            toValue: 0.3,
            duration: 380,
            useNativeDriver: true,
          }),
        ]),
      ),
    );
    Animated.parallel(animations).start();
    return () => animations.forEach((a) => a.stop());
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <View style={styles.dotsRow}>
      {anims.map((anim, i) => (
        <Animated.View key={i} style={[styles.dot, { opacity: anim }]} />
      ))}
    </View>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  root: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#3D2575', // fallback before Skia paints
  },
  content: {
    alignItems: 'center',
    paddingHorizontal: 32,
  },

  // ── Logo badge ──────────────────────────────────────────────────────────────
  logoBadge: {
    width: 120,
    height: 120,
    borderRadius: 32,
    backgroundColor: 'rgba(255,255,255,0.12)',
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.28)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 28,
    // glow shadow
    shadowColor: Colors.gold,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.55,
    shadowRadius: 24,
    elevation: 16,
  },
  logoEmoji: {
    fontSize: 64,
  },

  // ── Title ───────────────────────────────────────────────────────────────────
  title: {
    fontSize: 38,
    fontWeight: FontWeight.black,
    color: Colors.textPrimary,
    letterSpacing: 5,
    textAlign: 'center',
    textShadowColor: Colors.goldGlow,
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 18,
  },

  // ── Tagline ─────────────────────────────────────────────────────────────────
  tagline: {
    fontSize: FontSize.md,
    fontWeight: FontWeight.medium,
    color: 'rgba(255,255,255,0.55)',
    letterSpacing: 2.5,
    marginTop: 8,
    textAlign: 'center',
  },

  // ── Divider ─────────────────────────────────────────────────────────────────
  divider: {
    width: 60,
    height: 2,
    borderRadius: 1,
    backgroundColor: Colors.gold,
    marginTop: 24,
    marginBottom: 24,
    opacity: 0.7,
    shadowColor: Colors.goldGlow,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 8,
  },

  // ── Loading dots ────────────────────────────────────────────────────────────
  dotsRow: {
    flexDirection: 'row',
    gap: 8,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.gold,
  },
});
