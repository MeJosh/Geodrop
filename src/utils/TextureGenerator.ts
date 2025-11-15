import Phaser from 'phaser';
import { TileType, TileRegistry } from '@/config/tiles';
import { WorldConfig } from '@/config/world';
import { PlayerConfig } from '@/config/player';

/**
 * Type for custom tile generation functions
 */
type TileGeneratorFunction = (
  graphics: Phaser.GameObjects.Graphics,
  size: number,
  variation?: number
) => void;

/**
 * Generates placeholder tileset textures programmatically
 * Supports custom generation functions and connected textures
 */
export class TextureGenerator {
  /**
   * Generate player sprite texture
   */
  static generatePlayerSprite(scene: Phaser.Scene): void {
    const size = PlayerConfig.width;
    const key = 'player';

    // Skip if already exists
    if (scene.textures.exists(key)) {
      return;
    }

    const graphics = scene.add.graphics();

    // Draw player body (blue square)
    graphics.fillStyle(0x4a90e2);
    graphics.fillRect(0, 0, size, size);

    // Draw face/visor (lighter blue)
    graphics.fillStyle(0x7ec8e3);
    graphics.fillRect(6, 6, size - 12, 8);

    // Draw limbs (darker blue)
    graphics.fillStyle(0x2e5c8a);
    graphics.fillRect(2, size - 6, 6, 6); // Left leg
    graphics.fillRect(size - 8, size - 6, 6, 6); // Right leg

    // Add outline
    graphics.lineStyle(2, 0x000000, 1);
    graphics.strokeRect(1, 1, size - 2, size - 2);

    // Generate texture
    graphics.generateTexture(key, size, size);
    graphics.destroy();

    console.log('[TextureGenerator] Generated player sprite');
  }

  /**
   * Generate a tileset texture with all tile types
   */
  static generateTileset(scene: Phaser.Scene): void {
    const tileTypes = Object.values(TileType).filter((v) => typeof v === 'number') as TileType[];

    tileTypes.forEach((tileType) => {
      const tileDef = TileRegistry[tileType];

      if (tileDef.connectedTexture) {
        // Generate all 256 connected texture variants
        this.generateConnectedTextures(scene, tileType);
      } else {
        // Generate standard tile texture with variations
        this.generateStandardTile(scene, tileType);
      }
    });

    console.log('[TextureGenerator] Generated tileset textures');
  }

  /**
   * Generate standard (non-connected) tile texture with variations
   */
  private static generateStandardTile(scene: Phaser.Scene, tileType: TileType): void {
    const tileSize = WorldConfig.tileWidth;
    const tileDef = TileRegistry[tileType];
    const generator = this.getTileGenerator(tileType);

    // Generate base texture
    const baseKey = `tile_${tileType}`;
    if (!scene.textures.exists(baseKey)) {
      const graphics = scene.add.graphics();
      generator(graphics, tileSize);
      graphics.generateTexture(baseKey, tileSize, tileSize);
      graphics.destroy();
    }

    // Generate variation textures (3 variations per tile type)
    for (let variation = 0; variation < 3; variation++) {
      const varKey = `tile_${tileType}_var${variation}`;
      if (!scene.textures.exists(varKey)) {
        const graphics = scene.add.graphics();
        generator(graphics, tileSize, variation);
        graphics.generateTexture(varKey, tileSize, tileSize);
        graphics.destroy();
      }
    }
  }

  /**
   * Generate all 256 connected texture variants for a tile type
   * Uses 8-neighbor bitmask: NW, N, NE, W, E, SW, S, SE
   */
  private static generateConnectedTextures(scene: Phaser.Scene, tileType: TileType): void {
    const tileSize = WorldConfig.tileWidth;
    const generator = this.getTileGenerator(tileType);

    // Generate all 256 possible bitmask combinations
    for (let bitmask = 0; bitmask < 256; bitmask++) {
      // Generate base texture for this bitmask
      const baseKey = `tile_${tileType}_${bitmask}`;
      if (!scene.textures.exists(baseKey)) {
        const graphics = scene.add.graphics();
        this.drawConnectedTile(graphics, tileSize, bitmask, generator);
        graphics.generateTexture(baseKey, tileSize, tileSize);
        graphics.destroy();
      }

      // Generate variations for this bitmask
      for (let variation = 0; variation < 3; variation++) {
        const varKey = `tile_${tileType}_${bitmask}_var${variation}`;
        if (!scene.textures.exists(varKey)) {
          const graphics = scene.add.graphics();
          this.drawConnectedTile(graphics, tileSize, bitmask, generator, variation);
          graphics.generateTexture(varKey, tileSize, tileSize);
          graphics.destroy();
        }
      }
    }
  }

  /**
   * Draw a connected tile using 9-slice technique with smooth blending
   */
  private static drawConnectedTile(
    graphics: Phaser.GameObjects.Graphics,
    size: number,
    bitmask: number,
    generator: TileGeneratorFunction,
    variation?: number
  ): void {
    // Extract neighbor connections from bitmask
    // Bit order: NW(0), N(1), NE(2), W(3), E(4), SW(5), S(6), SE(7)
    const nw = (bitmask & 1) !== 0;
    const n = (bitmask & 2) !== 0;
    const ne = (bitmask & 4) !== 0;
    const w = (bitmask & 8) !== 0;
    const e = (bitmask & 16) !== 0;
    const sw = (bitmask & 32) !== 0;
    const s = (bitmask & 64) !== 0;
    const se = (bitmask & 128) !== 0;

    // Draw base tile
    generator(graphics, size, variation);

    // Draw smooth blending edges
    const blendSize = size / 4; // Size of corner blends

    // Top edge
    if (!n) {
      graphics.fillStyle(0x000000, 0.15);
      graphics.fillRect(0, 0, size, 2);
    }

    // Bottom edge
    if (!s) {
      graphics.fillStyle(0x000000, 0.15);
      graphics.fillRect(0, size - 2, size, 2);
    }

    // Left edge
    if (!w) {
      graphics.fillStyle(0x000000, 0.15);
      graphics.fillRect(0, 0, 2, size);
    }

    // Right edge
    if (!e) {
      graphics.fillStyle(0x000000, 0.15);
      graphics.fillRect(size - 2, 0, 2, size);
    }

    // Corner blending (only if adjacent edges are also connected)
    // Top-left corner
    if (!nw && n && w) {
      graphics.fillStyle(0x000000, 0.2);
      graphics.fillCircle(0, 0, blendSize);
    }

    // Top-right corner
    if (!ne && n && e) {
      graphics.fillStyle(0x000000, 0.2);
      graphics.fillCircle(size, 0, blendSize);
    }

    // Bottom-left corner
    if (!sw && s && w) {
      graphics.fillStyle(0x000000, 0.2);
      graphics.fillCircle(0, size, blendSize);
    }

    // Bottom-right corner
    if (!se && s && e) {
      graphics.fillStyle(0x000000, 0.2);
      graphics.fillCircle(size, size, blendSize);
    }
  }

  /**
   * Get the custom generator function for a tile type
   */
  private static getTileGenerator(tileType: TileType): TileGeneratorFunction {
    const tileDef = TileRegistry[tileType];

    // Return custom generators based on tile type
    switch (tileType) {
      case TileType.DIRT:
        return this.generateDirtTile.bind(this);
      case TileType.STONE:
        return this.generateStoneTile.bind(this);
      case TileType.ORE:
        return this.generateOreTile.bind(this);
      case TileType.BEDROCK:
        return this.generateBedrockTile.bind(this);
      default:
        return (graphics, size) => {
          graphics.fillStyle(tileDef.color);
          graphics.fillRect(0, 0, size, size);
        };
    }
  }

  /**
   * Custom generator for dirt tiles
   */
  private static generateDirtTile(
    graphics: Phaser.GameObjects.Graphics,
    size: number,
    variation: number = 0
  ): void {
    const baseColor = 0x8b5a3c;
    const darkColor = 0x6b4423;

    // Base fill
    graphics.fillStyle(baseColor);
    graphics.fillRect(0, 0, size, size);

    // Add very subtle texture with slight variation in position
    graphics.fillStyle(darkColor, 0.15);

    // Use variation to slightly offset the subtle texture, but keep it minimal
    const offset = variation * 0.5;
    graphics.fillRect(offset, offset, size / 3, size / 3);
    graphics.fillRect(size / 2 + offset, size / 2 + offset, size / 3, size / 3);

    // Add extremely subtle noise for texture depth
    graphics.fillStyle(darkColor, 0.05);
    for (let i = 0; i < 3; i++) {
      const x = ((i * 7 + variation * 11) % size);
      const y = ((i * 13 + variation * 17) % size);
      graphics.fillCircle(x, y, 0.5);
    }
  }

  /**
   * Custom generator for stone tiles
   */
  private static generateStoneTile(
    graphics: Phaser.GameObjects.Graphics,
    size: number,
    variation: number = 0
  ): void {
    const baseColor = 0x777777;

    // Base fill
    graphics.fillStyle(baseColor);
    graphics.fillRect(0, 0, size, size);

    // Add stone texture
    graphics.fillStyle(0x555555, 0.4);
    graphics.fillRect(4, 4, size - 8, size - 8);

    // Add variation
    const offset = variation * 2;
    graphics.fillStyle(0x999999, 0.3);
    graphics.fillCircle(size / 2 + offset, size / 2 - offset, size / 4);

    // Add border
    graphics.lineStyle(1, 0x000000, 0.2);
    graphics.strokeRect(0, 0, size, size);
  }

  /**
   * Custom generator for ore tiles
   */
  private static generateOreTile(
    graphics: Phaser.GameObjects.Graphics,
    size: number,
    variation: number = 0
  ): void {
    const baseColor = 0xffd700;

    // Base fill
    graphics.fillStyle(baseColor);
    graphics.fillRect(0, 0, size, size);

    // Add ore sparkles at different positions based on variation
    const offset = variation * 2;
    graphics.fillStyle(0xffaa00);
    graphics.fillCircle(size / 4 + offset, size / 4 + offset, 3);
    graphics.fillCircle((3 * size) / 4 - offset, (3 * size) / 4 - offset, 3);
    graphics.fillCircle((3 * size) / 4 + offset, size / 4 - offset, 2);

    // Add border
    graphics.lineStyle(1, 0x000000, 0.2);
    graphics.strokeRect(0, 0, size, size);
  }

  /**
   * Custom generator for bedrock tiles
   */
  private static generateBedrockTile(
    graphics: Phaser.GameObjects.Graphics,
    size: number,
    variation: number = 0
  ): void {
    const baseColor = 0x222222;

    // Base fill
    graphics.fillStyle(baseColor);
    graphics.fillRect(0, 0, size, size);

    // Add dark lines with variation
    graphics.lineStyle(2, 0x000000, 0.5);
    const offset = variation * 3;
    graphics.lineBetween(offset, 0, size, size - offset);
    graphics.lineBetween(size - offset, 0, 0, size - offset);

    // Add border
    graphics.lineStyle(1, 0x000000, 0.2);
    graphics.strokeRect(0, 0, size, size);
  }

  /**
   * Calculate bitmask for connected textures based on neighbors
   * Bit order: NW(0), N(1), NE(2), W(3), E(4), SW(5), S(6), SE(7)
   */
  static calculateBitmask(
    tileX: number,
    tileY: number,
    checkNeighbor: (x: number, y: number) => boolean
  ): number {
    let bitmask = 0;

    // Check all 8 neighbors
    if (checkNeighbor(tileX - 1, tileY - 1)) bitmask |= 1;   // NW
    if (checkNeighbor(tileX, tileY - 1)) bitmask |= 2;       // N
    if (checkNeighbor(tileX + 1, tileY - 1)) bitmask |= 4;   // NE
    if (checkNeighbor(tileX - 1, tileY)) bitmask |= 8;       // W
    if (checkNeighbor(tileX + 1, tileY)) bitmask |= 16;      // E
    if (checkNeighbor(tileX - 1, tileY + 1)) bitmask |= 32;  // SW
    if (checkNeighbor(tileX, tileY + 1)) bitmask |= 64;      // S
    if (checkNeighbor(tileX + 1, tileY + 1)) bitmask |= 128; // SE

    return bitmask;
  }
}
