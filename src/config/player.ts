/**
 * Player physics and movement configuration
 */
export const PlayerConfig = {
  // Sprite size
  width: 24,
  height: 24,

  // Movement
  moveSpeed: 200,
  jumpVelocity: -400,

  // Physics
  gravity: 600,
  maxFallSpeed: 800,
  drag: 1000,

  // Starting position (in tile coordinates)
  startTileX: 16,
  startTileY: 2,

  // Health
  maxHealth: 100,

  // Collision
  bodyOffsetX: 4,
  bodyOffsetY: 4,
  bodyWidth: 16,
  bodyHeight: 20,
} as const;
