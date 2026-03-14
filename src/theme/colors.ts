// ─── Heist — Vibrant & Playful Design System ─────────────────────────────────
// Social Heist Game · High Energy · Pop Colors
// Palette: Electric Indigo · Vivid Yellow · Hot Pink · Mint Green · Cyan Blue · Off-White
// ─────────────────────────────────────────────────────────────────────────────

export const Colors = {
  // ── Backgrounds ─────────────────────────────────────────────────────────
  background: '#5D3FD3',       // Electric Indigo — main app background (vivid, modern)
  surface: '#6B4FDC',          // Slightly lighter indigo — cards, panels
  surfaceElevated: '#7A5FE0',  // Elevated indigo — modals, elevated containers
  surfaceFrost: 'rgba(93,63,211,0.94)', // Frosted overlay panels
  cardBg: '#7A5FE0',           // Elevated indigo — card backgrounds

  // ── Primary ──────────────────────────────────────────────────────────────
  primary: '#F7F7F7',          // Off-White — main text on indigo bg
  primaryLight: '#D6CEFF',     // Soft lavender — secondary text
  inactive: '#8C7ABF',         // Muted indigo — disabled / cooldown elements
  border: '#7B6BC9',           // Subtle purple border

  // ── Heist Action Buttons ─────────────────────────────────────────────────
  shareGreen: '#6BCB77',       // Mint Green — Share button (friendly, trustworthy)
  shareGreenGlow: 'rgba(107,203,119,0.35)',
  stealRed: '#FF6B6B',         // Hot Pink-Red — Steal button (playful but dangerous)
  stealRedGlow: 'rgba(255,107,107,0.35)',
  shieldBlue: '#4D96FF',       // Cyan Blue — Shield button (cool, clean)
  shieldBlueGlow: 'rgba(77,150,255,0.35)',

  // ── Legacy aliases (kept for backward compat) ────────────────────────────
  neonGreen: '#6BCB77',
  neonGreenGlow: 'rgba(107,203,119,0.35)',
  bloodRed: '#FF6B6B',
  bloodRedGlow: 'rgba(255,107,107,0.35)',
  cyberGold: '#FFD93D',
  cyberGoldGlow: 'rgba(255,217,61,0.40)',
  electricPurple: '#5D3FD3',
  electricPurpleGlow: 'rgba(93,63,211,0.35)',

  // ── Vivid Yellow (primary accent / money / CTA) ──────────────────────────
  gold: '#FFD93D',             // Vivid Yellow — money, highlights, CTA (eye-catching)
  goldLight: 'rgba(255,217,61,0.20)',
  goldGlow: 'rgba(255,217,61,0.50)',
  goldDark: '#E6B800',

  // ── Cyan Blue (special / shield) ─────────────────────────────────────────
  electricBlue: '#4D96FF',
  electricBlueGlow: 'rgba(77,150,255,0.35)',

  // ── Accent aliases ────────────────────────────────────────────────────────
  accent: '#FFD93D',
  accentLight: 'rgba(255,217,61,0.18)',
  accentDark: '#E6B800',

  // ── Rarity tier colours ──────────────────────────────────────────────────
  rarityCommon: '#B0A8D9',
  rarityUncommon: '#6BCB77',
  rarityRare: '#4D96FF',
  rarityEpic: '#FF6B6B',
  rarityLegendary: '#FFD93D',

  // ── Typography ───────────────────────────────────────────────────────────
  textPrimary: '#F7F7F7',      // Off-White — main readable text
  textSecondary: '#C4B8F0',    // Soft lavender — subtitles, labels
  textDisabled: '#8C7ABF',     // Muted — disabled text
  textOnDark: '#F7F7F7',
  textGold: '#FFD93D',         // Vivid Yellow — coin / money text

  // ── Game states ──────────────────────────────────────────────────────────
  win: '#6BCB77',              // Mint Green — win / share result
  lose: '#FF6B6B',             // Hot Pink — eliminated
  neutral: '#8C7ABF',
  energy: '#4D96FF',
  coin: '#FFD93D',

  // ── Dividers & borders ───────────────────────────────────────────────────
  divider: 'rgba(247,247,247,0.12)',
  borderCard: 'rgba(247,247,247,0.08)',

  // ── Overlays ─────────────────────────────────────────────────────────────
  overlayLight: 'rgba(255,255,255,0.12)',
  overlayDark: 'rgba(30,15,80,0.75)',
  scrim: 'rgba(30,15,80,0.55)',

  // ── UI Layer Tokens ────────────────────────────────────────────────────────
  // Tab Bar — sit clearly below content on a dark layer
  tabBarBg: '#1A0F3C',           // Dark Navy Purple — tab bar bg (separate layer from screen)
  tabBarBorder: 'rgba(255,255,255,0.08)',

  // Glass cards — white 10% frost on purple bg (Glassmorphism)
  cardGlass: 'rgba(255,255,255,0.10)',
  cardGlassBorder: 'rgba(255,255,255,0.20)', // Slightly visible white border

  // Lavender border — subtle card framing on purple background
  lavenderBorder: 'rgba(200,180,255,0.35)',

  // Challenge / high-urgency CTA — Vivid Orange (NOT red on purple)
  challengeOrange: '#FF9500',
  challengeOrangeGlow: 'rgba(255,149,0,0.40)',
  challengeOrangeBg: 'rgba(255,149,0,0.14)',

  // Soft gold for secondary highlights
  softGold: '#FFE066',
} as const;

export type ColorKey = keyof typeof Colors;
