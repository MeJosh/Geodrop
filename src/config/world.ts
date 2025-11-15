/**
 * World generation and layout configuration
 */
export const WorldConfig = {
  // Tile dimensions
  tileWidth: 32,
  tileHeight: 32,

  // World size
  worldWidthInTiles: 32,
  worldHeightInTiles: 128,

  // Chunk settings for generation
  chunkHeight: 64,
  chunkWidth: 32,

  // Depth layers (in tiles)
  surfaceLayer: 5,
  dirtLayer: 20,
  stoneLayer: 100,

  // Generation seed (0 = random)
  seed: 0,
} as const;
