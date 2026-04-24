// ─── Lottie Animations Registry ──────────────────────────────────────────────
// Add new Lottie JSON files here and export them with a descriptive key.
// Usage: import { Animations } from '@assets/animations';
//        <LottieView source={Animations.character} ... />
// ─────────────────────────────────────────────────────────────────────────────

const Animations = {
  /** Main player character shown on the Home screen */
  character: require('./Character.json'),

  // ── Add more animations below ──────────────────────────────────────────────
  // loading:   require('./Loading.json'),
  // confetti:  require('./Confetti.json'),
  // explosion: require('./Explosion.json'),
  // coin:      require('./Coin.json'),
  // victory:   require('./Victory.json'),
};

export { Animations };
