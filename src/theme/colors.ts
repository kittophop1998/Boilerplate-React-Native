// ─── Heist — Light Purple Pop Design System ──────────────────────────────────
// Social Heist Game · Pop-Art Vibes · Light Lavender Palette
// Palette: Light Purple · Lavender · White · Deep Purple · Yellow · Cyan · Orange · Red
//
// Tips:
//  • On yellow buttons (#FFD23F) use deep-purple text (#4A3572) — not white
//  • Add shadow/elevation to cards & buttons for depth on light backgrounds
//  • Active/pressed state = slightly darker shade (e.g. #FFD23F → #E6BC38)
// ─────────────────────────────────────────────────────────────────────────────

export const Colors = {
  // ── Backgrounds ─────────────────────────────────────────────────────────
  background: '#9B7ED5',        // Light Purple — main app background
  surface: '#C7B4E8',           // Light Lavender — cards, panels (UI layer separation)
  surfaceElevated: '#D3C5EE',   // Lighter lavender — modals, elevated containers
  surfaceFrost: 'rgba(155,126,213,0.92)', // Frosted overlay panels
  cardBg: '#C7B4E8',            // Light Lavender — card backgrounds

  // ── Primary ──────────────────────────────────────────────────────────────
  primary: '#FFFFFF',           // White — main text on purple bg
  primaryLight: '#C7B4E8',      // Light Lavender — secondary text tint
  inactive: '#B8A8D9',          // Muted lavender — disabled / cooldown elements
  border: '#B0A0D0',            // Subtle lavender border

  // ── Heist Action Buttons ─────────────────────────────────────────────────
  // Share — Cyan Blue
  shareGreen: '#51E5FF',        // Vivid Cyan — Share button
  shareGreenGlow: 'rgba(81,229,255,0.35)',
  shareGreenActive: '#3ACDE8',  // Pressed/active state (darker cyan)

  // Steal — Pink-Red
  stealRed: '#FF6B6B',          // Vivid Pink-Red — Steal button
  stealRedGlow: 'rgba(255,107,107,0.35)',
  stealRedActive: '#E65555',    // Pressed/active state

  // Shield — Cyan-Teal
  shieldBlue: '#88E0EF',        // Cyan-Teal — Shield button
  shieldBlueGlow: 'rgba(136,224,239,0.35)',
  shieldBlueActive: '#6FCADB',  // Pressed/active state

  // Revenge / Challenge — Orange
  revengeOrange: '#FF9F1C',     // Orange — Revenge / Challenge button
  revengeOrangeGlow: 'rgba(255,159,28,0.38)',
  revengeOrangeActive: '#E68A0A', // Pressed/active state

  // ── Legacy aliases (kept for backward compat) ────────────────────────────
  neonGreen: '#51E5FF',         // remapped → share cyan
  neonGreenGlow: 'rgba(81,229,255,0.35)',
  bloodRed: '#FF6B6B',
  bloodRedGlow: 'rgba(255,107,107,0.35)',
  cyberGold: '#FFD23F',
  cyberGoldGlow: 'rgba(255,210,63,0.40)',
  electricPurple: '#9B7ED5',
  electricPurpleGlow: 'rgba(155,126,213,0.35)',

  // ── Action Yellow — primary CTA (Join Heist, etc.) ───────────────────────
  // ⚠️  Use textOnYellow (#4A3572) for text ON this button, NOT white
  gold: '#FFD23F',              // Vivid Yellow — primary CTA / money / highlights
  goldLight: 'rgba(255,210,63,0.20)',
  goldGlow: 'rgba(255,210,63,0.50)',
  goldDark: '#E6BC38',          // Active/pressed state of yellow button
  goldActive: '#E6BC38',        // Explicit active alias

  // ── Cyan Blue (legacy electricBlue alias) ────────────────────────────────
  electricBlue: '#51E5FF',
  electricBlueGlow: 'rgba(81,229,255,0.35)',

  // ── Accent aliases ────────────────────────────────────────────────────────
  accent: '#FFD23F',
  accentLight: 'rgba(255,210,63,0.18)',
  accentDark: '#E6BC38',

  // ── Rarity tier colours ──────────────────────────────────────────────────
  rarityCommon: '#C7B4E8',      // Lavender
  rarityUncommon: '#88E0EF',    // Cyan-Teal
  rarityRare: '#51E5FF',        // Vivid Cyan
  rarityEpic: '#FF6B6B',        // Pink-Red
  rarityLegendary: '#FFD23F',   // Vivid Yellow

  // ── Typography ───────────────────────────────────────────────────────────
  textPrimary: '#FFFFFF',       // White — main readable text on purple bg
  textSecondary: '#4A3572',     // Deep Purple — secondary text for contrast on light surfaces
  textDisabled: '#B8A8D9',      // Muted lavender — disabled text
  textOnDark: '#FFFFFF',
  textOnYellow: '#4A3572',      // Deep Purple — text ON yellow buttons (Pop-Art contrast)
  textGold: '#FFD23F',          // Yellow — coin / money highlights

  // ── Game states ──────────────────────────────────────────────────────────
  win: '#51E5FF',               // Cyan — win / share result
  lose: '#FF6B6B',              // Pink-Red — eliminated
  neutral: '#B8A8D9',
  energy: '#88E0EF',
  coin: '#FFD23F',

  // ── Dividers & borders ───────────────────────────────────────────────────
  divider: 'rgba(74,53,114,0.15)',    // Deep purple tint divider (works on light bg)
  borderCard: 'rgba(74,53,114,0.10)',

  // ── Overlays ─────────────────────────────────────────────────────────────
  overlayLight: 'rgba(255,255,255,0.18)',
  overlayDark: 'rgba(74,53,114,0.65)',
  scrim: 'rgba(74,53,114,0.50)',

  // ── UI Layer Tokens ────────────────────────────────────────────────────────
  // Tab Bar — slightly deeper purple to sit below content
  tabBarBg: '#7B60B8',           // Deeper Purple — tab bar bg (visual layer separation)
  tabBarBorder: 'rgba(255,255,255,0.15)',

  // Glass cards — white frost on light purple bg (Glassmorphism)
  cardGlass: 'rgba(255,255,255,0.22)',
  cardGlassBorder: 'rgba(255,255,255,0.40)',

  // Lavender border — card framing
  lavenderBorder: 'rgba(199,180,232,0.60)',

  // ── Shadow tokens — use these for card/button depth on light bg ───────────
  // e.g. shadowColor: Colors.shadowCard, shadowOffset: {width:0,height:4}, shadowOpacity:1, shadowRadius:12
  shadowCard: 'rgba(74,53,114,0.20)',    // Soft deep-purple shadow for cards
  shadowButton: 'rgba(74,53,114,0.28)', // Slightly stronger for buttons
  shadowYellow: 'rgba(255,210,63,0.45)', // Yellow glow-shadow for CTA button

  // Challenge / high-urgency CTA — Orange
  challengeOrange: '#FF9F1C',
  challengeOrangeGlow: 'rgba(255,159,28,0.40)',
  challengeOrangeBg: 'rgba(255,159,28,0.14)',

  // Soft gold for secondary highlights
  softGold: '#FFD23F',
} as const;

export type ColorKey = keyof typeof Colors;
