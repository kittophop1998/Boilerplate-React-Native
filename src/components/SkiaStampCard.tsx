// ─── SkiaStampCard — One Piece TCG exact shape ───────────────────────────────
//
//  Card SVG shape (outer):
//
//    (r,0)──────────────(W-cut, 0)
//     │                      ╲  ← diagonal cut top-right
//     │                   (W, cut)
//     │                       │
//     │     ARTWORK            │
//     │  (counter strip left)  │
//     │                       │
//    (0,H-r)             (W, H-r)
//     ╰──────────────────────╯  ← rounded bottom corners
//
//  Inner border: same shape, inset 3px
//  Counter strip: thin vertical band on the LEFT inside inner border
//  Bottom panel: solid color block (~28% height) inside inner border
//
import React, { useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import {
  Canvas,
  Path,
  LinearGradient,
  RadialGradient,
  vec,
  Group,
  BlurMask,
  Skia,
  Rect,
  Image as SkiaImage,
  useImage,
} from '@shopify/react-native-skia';
import { Spacing, FontSize, FontWeight } from '@theme/index';
import type { StampCard as StampCardType, Rarity } from '@game/stamp';

// ─── Image asset map ──────────────────────────────────────────────────────────
// useImage (Skia hook) accepts require() number directly
const IMAGE_SOURCES: Record<string, number> = {
  image1: require('../../public/images/image1.png'),
  image2: require('../../public/images/image2.png'),
};

// ─── Card dimensions ──────────────────────────────────────────────────────────
const SCREEN_W = Dimensions.get('window').width;
const CARD_MARGIN = Spacing.xs;
const COL_COUNT = 3;
const CARD_WIDTH = Math.floor(
  (SCREEN_W - Spacing.sm * 2 - CARD_MARGIN * COL_COUNT * 2) / COL_COUNT,
);
const CARD_HEIGHT = Math.floor(CARD_WIDTH * 1.52);

export { CARD_WIDTH, CARD_HEIGHT };

// ─── Shape constants ──────────────────────────────────────────────────────────
const CR = 7;          // outer corner radius
const CUT = 13;        // diagonal cut size at top-right
const OB = 3;          // outer border stroke width
const IB_INSET = 4;    // distance from outer edge to inner border
const IB = 1;          // inner border stroke width

// Artwork fills edge-to-edge inside inner border (no left strip)
const CONTENT_L = IB_INSET + IB;   // left edge of artwork
const CONTENT_T = IB_INSET + IB;   // top edge of artwork
const CONTENT_R = IB_INSET + IB;   // right inset

// Bottom panel — detail area only
const BOTTOM_H = Math.floor(CARD_HEIGHT * 0.27);

// Artwork height = card - top inset - bottom panel
const ART_H = CARD_HEIGHT - CONTENT_T - BOTTOM_H;

// ─── SVG path builders ────────────────────────────────────────────────────────
function outerSVG(w: number, h: number): string {
  return [
    `M ${CR} 0`,
    `L ${w - CUT} 0`,
    `L ${w} ${CUT}`,
    `L ${w} ${h - CR}`,
    `Q ${w} ${h} ${w - CR} ${h}`,
    `L ${CR} ${h}`,
    `Q 0 ${h} 0 ${h - CR}`,
    `L 0 ${CR}`,
    `Q 0 0 ${CR} 0`,
    'Z',
  ].join(' ');
}

function innerSVG(w: number, h: number, inset: number): string {
  const iw = w - inset * 2;
  const ih = h - inset * 2;
  const ir = Math.max(CR - inset, 2);
  const ic = Math.max(CUT - inset, 3);
  return [
    `M ${ir} 0`,
    `L ${iw - ic} 0`,
    `L ${iw} ${ic}`,
    `L ${iw} ${ih - ir}`,
    `Q ${iw} ${ih} ${iw - ir} ${ih}`,
    `L ${ir} ${ih}`,
    `Q 0 ${ih} 0 ${ih - ir}`,
    `L 0 ${ir}`,
    `Q 0 0 ${ir} 0`,
    'Z',
  ].join(' ');
}

// ─── Rarity palette ───────────────────────────────────────────────────────────
interface Palette {
  ob1: string; ob2: string;
  ib: string;
  strip1: string; strip2: string;
  panel1: string; panel2: string;
  body: string;
  glow: string; glowR: number;
  attr: string;
  charLabel: string;
  isSpecial: boolean;
}

const PALETTE: Record<Rarity, Palette> = {
  C: {
    ob1: '#B0B8C8', ob2: '#D8E0EC',
    ib: 'rgba(255,255,255,0.50)',
    strip1: '#6A7080', strip2: '#8A90A0',
    panel1: '#35373D', panel2: '#28292E',
    body: '#18191F',
    glow: 'transparent', glowR: 0,
    attr: '#9099AA',
    charLabel: '#C0C8D8',
    isSpecial: false,
  },
  R: {
    ob1: '#2A2A32', ob2: '#505060',
    ib: 'rgba(180,180,200,0.45)',
    strip1: '#1E1E28', strip2: '#38384A',
    panel1: '#0E0E16', panel2: '#1A1A24',
    body: '#0A0A10',
    glow: 'rgba(100,100,160,0.40)', glowR: 5,
    attr: '#7080CC',
    charLabel: '#8090C0',
    isSpecial: false,
  },
  SR: {
    ob1: '#B89000', ob2: '#FFD84A',
    ib: 'rgba(255,220,80,0.60)',
    strip1: '#7A5C00', strip2: '#C89800',
    panel1: '#2E1E00', panel2: '#4A3000',
    body: '#140E00',
    glow: 'rgba(255,200,0,0.70)', glowR: 10,
    attr: '#FFD700',
    charLabel: '#FFD060',
    isSpecial: false,
  },
  SP: {
    ob1: '#8040C0', ob2: '#FF70C0',
    ib: 'rgba(255,160,230,0.55)',
    strip1: '#4A1870', strip2: '#9040A0',
    panel1: '#220030', panel2: '#3A0050',
    body: '#100018',
    glow: 'rgba(180,60,255,0.80)', glowR: 14,
    attr: '#FF70C0',
    charLabel: '#E080FF',
    isSpecial: true,
  },
};

// ─── Props ────────────────────────────────────────────────────────────────────
interface Props {
  card: StampCardType;
  isFavorite?: boolean;
  isSelected?: boolean;
  onPress?: () => void;
}

export default function SkiaStampCard({
  card,
  isFavorite = false,
  isSelected = false,
  onPress,
}: Props) {
  const pal = PALETTE[card.rarity] ?? PALETTE.C;
  // useImage loads the asset as SkImage — works with require() numbers
  const skImage = useImage(IMAGE_SOURCES[card.artworkImage ?? ''] ?? IMAGE_SOURCES.image1);

  const W = CARD_WIDTH;
  const H = CARD_HEIGHT;

  const pathOuter = useMemo(() => {
    return Skia.Path.MakeFromSVGString(outerSVG(W, H)) ?? Skia.Path.Make();
  }, [W, H]);

  const pathInner = useMemo(() => {
    const s = innerSVG(W, H, IB_INSET);
    return Skia.Path.MakeFromSVGString(s) ?? Skia.Path.Make();
  }, [W, H]);

  const panelY = H - BOTTOM_H;
  const totalPower = card.power.top + card.power.bottom + card.power.left + card.power.right;

  const content = (
    <View style={[styles.card, isSelected && styles.selected]}>

      {/* ── SKIA CANVAS ───────────────────────────────────────────────────── */}
      <Canvas style={StyleSheet.absoluteFill} pointerEvents="none">

        {/* 1. Card body fill */}
        <Path path={pathOuter} color={pal.body} />
        {pal.isSpecial && (
          <Path path={pathOuter}>
            <LinearGradient
              start={vec(0, 0)} end={vec(W, H)}
              colors={['#1A0028', '#300010']}
            />
          </Path>
        )}

        {/* 2. ARTWORK — clipped to outerPath shape (no overflow) ────────── */}
        {skImage && (
          <Group clip={pathOuter}>
            <SkiaImage
              image={skImage}
              fit="cover"
              x={CONTENT_L}
              y={CONTENT_T}
              width={W - CONTENT_L - CONTENT_R}
              height={ART_H}
            />
          </Group>
        )}

        {/* 3. SP shimmer over artwork */}
        {pal.isSpecial && (
          <Rect
            x={CONTENT_L} y={CONTENT_T}
            width={W - CONTENT_L - CONTENT_R}
            height={ART_H}
          >
            <RadialGradient
              c={vec(W * 0.58, CONTENT_T + ART_H * 0.35)}
              r={W * 0.65}
              colors={['rgba(255,160,255,0.20)', 'transparent']}
            />
          </Rect>
        )}

        {/* 4. Bottom panel fill (drawn over artwork) */}
        <Rect
          x={IB_INSET + IB}
          y={panelY}
          width={W - (IB_INSET + IB) * 2}
          height={BOTTOM_H - IB_INSET - IB}
        >
          <LinearGradient
            start={vec(0, panelY)} end={vec(0, H)}
            colors={[pal.panel1, pal.panel2]}
          />
        </Rect>

        {/* 5. Separator line */}
        <Path
          path={`M ${IB_INSET + IB} ${panelY} L ${W - IB_INSET - IB} ${panelY}`}
          style="stroke"
          strokeWidth={1.5}
          color={pal.ob1}
          opacity={0.75}
        />

        {/* 6. Outer glow */}
        {pal.glowR > 0 && (
          <Path path={pathOuter} style="stroke" strokeWidth={OB + 3} color={pal.glow}>
            <BlurMask blur={pal.glowR} style="outer" respectCTM />
          </Path>
        )}

        {/* 7. Outer border — drawn last so it's always on top */}
        <Path path={pathOuter} style="stroke" strokeWidth={OB}>
          <LinearGradient
            start={vec(0, 0)} end={vec(W, H)}
            colors={[pal.ob1, pal.ob2]}
          />
        </Path>

        {/* 8. Inner border line */}
        <Group transform={[{ translateX: IB_INSET }, { translateY: IB_INSET }]}>
          <Path path={pathInner} style="stroke" strokeWidth={IB} color={pal.ib} />
        </Group>

      </Canvas>

      {/* ── TOP-LEFT: Cost bubble ─────────────────────────────────────────── */}
      <View style={[styles.costWrap, { borderColor: pal.ob2 }]}>
        <View style={[styles.costCircle, { backgroundColor: pal.ob1 }]}>
          <Text style={styles.costTxt}>{card.power.top}</Text>
        </View>
      </View>

      {/* ── TOP-RIGHT: Power + attr ───────────────────────────────────────── */}
      <View style={[styles.powerWrap, { top: CUT + 2 }]}>
        <Text style={[styles.powerNum, { color: pal.ob2 }]}>{totalPower * 100}</Text>
        <View style={[styles.attrBadge, { backgroundColor: pal.ob1 }]}>
          <Text style={styles.attrTxt}>{card.rarity}</Text>
        </View>
      </View>

      {/* ── BOTTOM PANEL ──────────────────────────────────────────────────── */}
      <View style={[styles.bottomPanel, { top: panelY }]}>
        <Text style={[styles.charLabel, { color: pal.charLabel }]}>CHARACTER</Text>
        <Text style={styles.cardName} numberOfLines={1}>{card.name}</Text>
        <Text style={styles.seriesTxt} numberOfLines={1}>{card.series}</Text>
      </View>

      {/* ── FAV & ABILITY ─────────────────────────────────────────────────── */}
      {isFavorite && <Text style={styles.favPin}>❤️</Text>}
      {card.ability && (
        <View style={[styles.abilityBadge, { backgroundColor: pal.strip1 }]}>
          <Text style={styles.abilityIcon}>{card.ability.icon}</Text>
        </View>
      )}

      {/* ── SELECTED OVERLAY ──────────────────────────────────────────────── */}
      {isSelected && <View style={styles.selectedOverlay} />}
    </View>
  );

  if (onPress) {
    return (
      <TouchableOpacity onPress={onPress} activeOpacity={0.80} style={styles.touch}>
        {content}
      </TouchableOpacity>
    );
  }
  return <View style={styles.touch}>{content}</View>;
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  touch: {
    width: CARD_WIDTH,
    height: CARD_HEIGHT,
    margin: CARD_MARGIN,
  },
  card: {
    width: CARD_WIDTH,
    height: CARD_HEIGHT,
    borderRadius: CR,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.40,
    shadowRadius: 8,
    elevation: 10,
  },
  selected: { transform: [{ scale: 1.05 }] },

  costWrap: {
    position: 'absolute',
    top: 3, left: 3,
    width: 22, height: 22,
    borderRadius: 11,
    borderWidth: 1.5,
    padding: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  costCircle: {
    width: 16, height: 16,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  costTxt: {
    color: '#FFF',
    fontSize: 8,
    fontWeight: FontWeight.bold,
    lineHeight: 10,
  },

  powerWrap: {
    position: 'absolute',
    right: 4,
    alignItems: 'flex-end',
    gap: 1,
  },
  powerNum: {
    fontSize: 11,
    fontWeight: FontWeight.bold,
    letterSpacing: -0.5,
    textShadowColor: 'rgba(0,0,0,0.80)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  attrBadge: {
    paddingHorizontal: 3,
    paddingVertical: 1,
    borderRadius: 3,
    minWidth: 14,
    alignItems: 'center',
  },
  attrTxt: {
    color: '#FFF',
    fontSize: 5,
    fontWeight: FontWeight.bold,
    letterSpacing: 0.5,
  },

  bottomPanel: {
    position: 'absolute',
    left: IB_INSET + IB + 1,
    right: IB_INSET + IB + 1,
    bottom: IB_INSET + IB,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 2,
  },
  charLabel: {
    fontSize: 4.5,
    fontWeight: FontWeight.semiBold,
    letterSpacing: 1.5,
    opacity: 0.85,
    marginBottom: 1,
  },
  cardName: {
    fontSize: FontSize.xs,
    fontWeight: FontWeight.bold,
    color: '#FFFFFF',
    letterSpacing: -0.3,
    textAlign: 'center',
  },
  seriesTxt: {
    fontSize: 4.5,
    color: 'rgba(255,255,255,0.55)',
    marginTop: 1,
    textAlign: 'center',
  },

  favPin: {
    position: 'absolute',
    bottom: BOTTOM_H + 3,
    right: CONTENT_R + 3,
    fontSize: 9,
  },
  abilityBadge: {
    position: 'absolute',
    bottom: BOTTOM_H + 3,
    left: CONTENT_L + 2,
    width: 14, height: 14,
    borderRadius: 7,
    alignItems: 'center',
    justifyContent: 'center',
  },
  abilityIcon: { fontSize: 8 },

  selectedOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(225,112,85,0.22)',
    borderRadius: CR,
  },
});
