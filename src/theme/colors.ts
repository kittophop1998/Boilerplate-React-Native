// ─── ฝากหน่อย (Fark-Noi) ─────────────────────────────────────────────────────
// Peer-to-Peer Errand App · Cute & Vibrant Palette
// Palette: White · Coral Pink · Turquoise · Sunshine Yellow
//
// Rule 60-30-10:
//  • 60% → background (#FFF9F5) — warm white base, soft & friendly
//  • 30% → coral pink (#FF6B6B)  — hero buttons, active states, Magic Bubble
//  • 10% → turquoise (#00C9B1)   — scout cards, hero banner, info states
//
// Sunshine Yellow (#FFD93D) → tip tags, rewards, trust badges (use dark text)
//
// Tips:
//  • On coral (#FF6B6B) buttons → white text (#FFFFFF)
//  • On turquoise (#00C9B1) → white text (#FFFFFF)
//  • On yellow (#FFD93D) → dark text (#2D2D2D)
//  • Cards: pure white (#FFFFFF) with soft coral/turquoise border tints
//  • borderRadius: 16–24px for cute friendly feel
//  • Shadows: warm-tinted (coral/pink at 8–12% opacity)
// ─────────────────────────────────────────────────────────────────────────────

export const Colors = {
  // ── Backgrounds (60%) ────────────────────────────────────────────────────
  background: '#FFF9F5',        // Warm White — soft peachy base
  surface: '#FFFFFF',           // Pure White — cards & containers
  surfaceElevated: '#FFF1EB',   // Soft peach — modals, elevated containers
  surfaceFrost: 'rgba(255,255,255,0.88)', // Glassmorphism overlay panels
  cardBg: '#FFFFFF',            // Card background

  // ── Coral Pink — Primary CTA (30%) ───────────────────────────────────────
  // ⚠️  Use white (#FFFFFF) for text ON coral buttons
  primary: '#2D2D2D',           // Dark Charcoal — headers, primary text
  primaryLight: '#5A5A5A',      // Medium Charcoal — subheadings
  inactive: '#D1C4BE',          // Warm Grey — disabled elements
  border: '#F0E6E1',            // Warm light border — dividers

  // ── Coral Pink CTA ───────────────────────────────────────────────────────
  accent: '#FF6B6B',            // Coral Pink — Magic Bubble, CTA buttons
  accentLight: 'rgba(255,107,107,0.12)',
  accentGlow: 'rgba(255,107,107,0.30)',
  accentDark: '#E05555',        // Active/pressed coral
  accentActive: '#E05555',      // Explicit active alias

  // ── Turquoise — Scout / Info (10%) ───────────────────────────────────────
  // ⚠️  Use white (#FFFFFF) for text ON turquoise
  blue: '#00C9B1',              // Turquoise — scout hero card, join button
  blueLight: 'rgba(0,201,177,0.12)',
  blueGlow: 'rgba(0,201,177,0.28)',
  blueDark: '#00A896',          // Active/pressed turquoise
  blueActive: '#00A896',        // Explicit active alias

  // ── Sunshine Yellow — Tips / Rewards ─────────────────────────────────────
  // ⚠️  Use dark text (#2D2D2D) ON yellow — NOT white
  gold: '#FFD93D',              // Sunshine Yellow — tip tags, earn badges
  goldLight: 'rgba(255,217,61,0.15)',
  goldGlow: 'rgba(255,217,61,0.35)',
  goldDark: '#E6C200',          // Active/pressed yellow
  goldActive: '#E6C200',        // Explicit active alias

  // ── Subtle / Muted ───────────────────────────────────────────────────────
  subtle: '#9E8F8A',            // Warm Greige — descriptions, secondary labels
  subtleLight: 'rgba(158,143,138,0.12)',

  // ── Action buttons (legacy aliases mapped to new palette) ────────────────
  shareGreen: '#0EA5E9',        // → Sky Blue
  shareGreenGlow: 'rgba(0,201,177,0.28)',
  shareGreenActive: '#00A896',

  stealRed: '#FF6B6B',          // Coral — destructive / cancel actions
  stealRedGlow: 'rgba(255,107,107,0.30)',
  stealRedActive: '#E05555',

  shieldBlue: '#D1C4BE',
  shieldBlueGlow: 'rgba(209,196,190,0.40)',
  shieldBlueActive: '#B5A8A3',

  revengeOrange: '#FF9F43',
  revengeOrangeGlow: 'rgba(255,159,67,0.30)',
  revengeOrangeActive: '#E8892A',

  // ── Legacy aliases (kept for backward compat) ────────────────────────────
  neonGreen: '#00C9B1',
  neonGreenGlow: 'rgba(0,201,177,0.28)',
  bloodRed: '#FF6B6B',
  bloodRedGlow: 'rgba(255,107,107,0.30)',
  cyberGold: '#FFD93D',
  cyberGoldGlow: 'rgba(255,217,61,0.35)',
  electricPurple: '#C084FC',
  electricPurpleGlow: 'rgba(192,132,252,0.25)',
  electricBlue: '#00C9B1',
  electricBlueGlow: 'rgba(0,201,177,0.28)',
  accentAlt: '#00C9B1',
  accentAltLight: 'rgba(0,201,177,0.12)',
  accentAltDark: '#00A896',

  // ── Trust Badge / Tier colours ────────────────────────────────────────────
  rarityCommon: '#D1C4BE',      // Warm Grey — new user
  rarityUncommon: '#00C9B1',    // Turquoise — trusted
  rarityRare: '#00A896',        // Deep Turquoise — verified
  rarityEpic: '#FF6B6B',        // Coral — top scout
  rarityLegendary: '#FFD93D',   // Sunshine — legend courier

  // ── Typography ───────────────────────────────────────────────────────────
  // Font recommendation: 'IBMPlexSansThai' / 'Sarabun'
  textPrimary: '#2D2D2D',       // Dark Charcoal — headlines, key numbers
  textSecondary: '#9E8F8A',     // Warm Greige — descriptions, captions
  textDisabled: '#D1C4BE',      // Warm Grey — disabled text
  textOnDark: '#FFFFFF',        // White — text on dark surfaces
  textOnYellow: '#2D2D2D',      // Dark Charcoal — text ON yellow (contrast)
  textOnAccent: '#FFFFFF',      // White — text ON coral buttons
  textOnBlue: '#FFFFFF',        // White — text ON turquoise surfaces
  textGold: '#E6C200',          // Dark Yellow — highlights / tip text

  // ── States ───────────────────────────────────────────────────────────────
  win: '#10B981',               // Emerald — success / completed order
  lose: '#FF6B6B',              // Coral — cancelled / failed
  neutral: '#D1C4BE',           // Warm Grey — neutral / pending
  energy: '#00C9B1',            // Turquoise — active / in progress
  coin: '#FFD93D',              // Sunshine — coins / tips

  // ── Dividers & borders ───────────────────────────────────────────────────
  divider: 'rgba(240,230,225,0.80)',
  borderCard: 'rgba(240,230,225,0.60)',

  // ── Overlays ─────────────────────────────────────────────────────────────
  overlayLight: 'rgba(255,255,255,0.80)',
  overlayDark: 'rgba(45,45,45,0.50)',
  scrim: 'rgba(45,45,45,0.35)',

  // ── UI Layer Tokens ───────────────────────────────────────────────────────
  tabBarBg: 'rgba(255,255,255,0.88)',   // Glassmorphism tab bar
  tabBarBorder: 'rgba(240,230,225,0.60)',
  cardGlass: 'rgba(255,255,255,0.90)',
  cardGlassBorder: 'rgba(255,255,255,0.98)',
  accentBorder: 'rgba(255,107,107,0.30)',
  blueBorder: 'rgba(0,201,177,0.30)',

  // ── Shadow tokens (warm, coral-tinted) ───────────────────────────────────
  shadowCard: 'rgba(255,107,107,0.07)',   // Subtle coral card shadow
  shadowButton: 'rgba(255,107,107,0.18)', // Coral button shadow
  shadowYellow: 'rgba(255,217,61,0.25)',
  shadowAccent: 'rgba(255,107,107,0.22)',
  shadowBlue: 'rgba(0,201,177,0.22)',

  // ── Danger / Alert ────────────────────────────────────────────────────────
  danger: '#FF6B6B',
  dangerGlow: 'rgba(255,107,107,0.30)',
  dangerBg: 'rgba(255,107,107,0.08)',
  challengeOrange: '#FF9F43',           // Orange — warning / fee calculation
  challengeOrangeGlow: 'rgba(255,159,67,0.30)',
  challengeOrangeBg: 'rgba(255,159,67,0.08)',
  softGold: '#FFE87D',                  // Soft Sunshine — gentle highlight

  // ── Input / Form tokens ───────────────────────────────────────────────────
  inputBorderBottom: '#F0E6E1',         // Warm peach border-bottom
  inputFill: '#FFF1EB',                 // Soft peach fill
  inputFocus: '#FF6B6B',                // Coral focus ring
  dashedBorder: '#D1C4BE',              // Dashed border for upload/drop zones

  // ── Chip / Filter tokens ──────────────────────────────────────────────────
  chipBorder: '#F0E6E1',                // Outline chip border (unselected)
  chipBorderSelected: '#FF6B6B',        // Outline chip border (selected)
  chipFillSelected: '#FF6B6B',          // Solid fill when chip is selected
  chipTextSelected: '#FFFFFF',          // Text on selected chip
  chipText: '#9E8F8A',                  // Text on unselected chip

  // ── Progress / Stepper tokens ─────────────────────────────────────────────
  stepperTrack: '#F0E6E1',              // Warm peach track background
  stepperFill: '#FF6B6B',               // Coral fill (active steps)
  stepperComplete: '#10B981',           // Emerald — completed step

  // ── Neumorphic Glass tokens ───────────────────────────────────────────────
  neumBase: '#FFF1EB',                  // Neumorphic peach base
  neumLight: 'rgba(255,255,255,0.92)',  // Bright highlight shadow
  neumDark: 'rgba(200,180,170,0.50)',   // Warm depth shadow
  neumInsetLight: 'rgba(255,255,255,0.78)',
  neumInsetDark: 'rgba(200,180,170,0.45)',
  neumBorder: 'rgba(255,255,255,0.72)',

  // Glassmorphism (warm tones)
  glassFrost: 'rgba(255,249,245,0.80)',        // Frosted peach panel
  glassBorder: 'rgba(255,255,255,0.60)',        // Glass panel border
  glassShadow: 'rgba(255,107,107,0.10)',        // Coral-tinted glass shadow
  glassHeaderBg: 'rgba(255,249,245,0.88)',      // Header frosted glass

  // Gradient endpoints (coral → turquoise)
  gradBlueStart: '#4DDDD0',             // Light turquoise
  gradBlueEnd: '#00A896',               // Deep turquoise
  gradBlueMid: '#00C9B1',              // Mid turquoise
  gradCoralStart: '#FFB3B3',            // Light coral
  gradCoralEnd: '#E05555',              // Deep coral
  gradCoralMid: '#FF6B6B',             // Mid coral

  // GPS / Location status colours
  gpsSearching: '#FF9F43',             // Orange — locating
  gpsFound: '#10B981',                 // Emerald — captured
  gpsPulse: 'rgba(255,107,107,0.22)',  // Coral pulse ring

  // Photo / receipt glow
  photoGlow: 'rgba(0,201,177,0.18)',
  photoGlowStrong: 'rgba(0,201,177,0.32)',

  // ── Fark-Noi specific ─────────────────────────────────────────────────────
  escrowBg: 'rgba(0,201,177,0.10)',     // Turquoise — escrow / safe payment bg
  escrowBorder: 'rgba(0,201,177,0.30)', // Escrow card border
  tipBg: 'rgba(255,217,61,0.18)',       // Yellow tip tag background
  tipBorder: 'rgba(255,217,61,0.50)',   // Tip tag border
  scoutActive: '#00C9B1',               // Active scout color
  scoutActiveBg: 'rgba(0,201,177,0.10)',
  requestPending: '#FF9F43',            // Pending order color
  requestPendingBg: 'rgba(255,159,67,0.10)',
  trustBadgeBg: 'rgba(255,217,61,0.15)',// Trust badge background
} as const;

export type ColorKey = keyof typeof Colors;
