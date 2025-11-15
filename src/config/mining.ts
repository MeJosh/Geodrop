/**
 * Mining mechanics configuration
 */
export const MiningConfig = {
  // Mining speed (hardness points reduced per second)
  miningSpeed: 2.0,

  // Mining range (in pixels from player center)
  miningRange: 40,

  // Cooldown after landing before mining is allowed (in milliseconds)
  landingCooldown: 10,

  // Visual indicator settings
  indicatorAlpha: 0.3,
  indicatorColor: 0xffff00, // Yellow overlay on target tile

  // Progress bar settings
  progressBarHeight: 4,
  progressBarColor: 0x00ff00,
  progressBarBackgroundColor: 0x333333,
} as const;
