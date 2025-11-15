import { TileType } from '@/config/tiles';
import { WorldConfig } from '@/config/world';
import { WorldData, GenerationParams } from '@/types/WorldTypes';
import { TileGrid } from '@/types/TileTypes';
import { RNG } from '@/utils/RNG';

/**
 * GenerationSystem - Procedurally generates the game world
 * Creates terrain layers with depth-based variation
 */
export class GenerationSystem {
  private rng: RNG;
  private params: GenerationParams;

  constructor(params?: Partial<GenerationParams>) {
    this.params = {
      width: params?.width ?? WorldConfig.worldWidthInTiles,
      height: params?.height ?? WorldConfig.worldHeightInTiles,
      seed: params?.seed ?? (WorldConfig.seed || Date.now()),
      surfaceDepth: params?.surfaceDepth ?? WorldConfig.surfaceLayer,
      dirtDepth: params?.dirtDepth ?? WorldConfig.dirtLayer,
      stoneDepth: params?.stoneDepth ?? WorldConfig.stoneLayer,
    };

    this.rng = new RNG(this.params.seed);
    console.log(`[GenerationSystem] Initialized with seed: ${this.params.seed}`);
  }

  /**
   * Generate a complete world
   */
  generate(): WorldData {
    console.log('[GenerationSystem] Generating world...');

    const tiles = this.generateTiles();

    return {
      tiles,
      width: this.params.width,
      height: this.params.height,
      seed: this.params.seed!,
    };
  }

  /**
   * Generate the tile grid
   */
  private generateTiles(): TileGrid {
    const { width, height, surfaceDepth, dirtDepth } = this.params;
    const tiles: TileGrid = [];

    for (let y = 0; y < height; y++) {
      const row: TileType[] = [];

      for (let x = 0; x < width; x++) {
        const tileType = this.generateTileAt(x, y, surfaceDepth!, dirtDepth!);
        row.push(tileType);
      }

      tiles.push(row);
    }

    return tiles;
  }

  /**
   * Generate a single tile based on depth and position
   */
  private generateTileAt(x: number, y: number, surfaceDepth: number, dirtDepth: number): TileType {
    // Surface layer - mostly air
    if (y < surfaceDepth) {
      return TileType.EMPTY;
    }

    // Create some surface variation
    const surfaceVariation = Math.sin(x * 0.2) * 2;
    const adjustedSurface = surfaceDepth + surfaceVariation;

    if (y < adjustedSurface) {
      return TileType.EMPTY;
    }

    // Dirt layer
    if (y < surfaceDepth + dirtDepth) {
      // Small chance of ore in dirt
      if (this.rng.nextBool(0.02)) {
        return TileType.ORE;
      }
      return TileType.DIRT;
    }

    // Stone layer
    // Add some cave pockets
    const caveNoise = this.simplexNoise(x, y, 0.1);
    if (caveNoise > 0.6) {
      return TileType.EMPTY; // Cave
    }

    // Ore veins in stone
    if (this.rng.nextBool(0.05)) {
      return TileType.ORE;
    }

    // Bedrock at bottom
    if (y >= this.params.height - 2) {
      return TileType.BEDROCK;
    }

    return TileType.STONE;
  }

  /**
   * Simple 2D noise function (simplified Perlin-like noise)
   * Returns value between 0 and 1
   */
  private simplexNoise(x: number, y: number, scale: number): number {
    const scaledX = x * scale;
    const scaledY = y * scale;

    // Use sine waves to create pseudo-noise
    const noise1 = Math.sin(scaledX * 2.1 + scaledY * 1.3);
    const noise2 = Math.sin(scaledX * 1.7 - scaledY * 2.3);
    const noise3 = Math.sin((scaledX + scaledY) * 0.9);

    const combined = (noise1 + noise2 + noise3) / 3;
    return (combined + 1) / 2; // Normalize to 0-1
  }

  /**
   * Get generation parameters
   */
  getParams(): GenerationParams {
    return this.params;
  }

  /**
   * Get the seed used for generation
   */
  getSeed(): number {
    return this.params.seed!;
  }
}
