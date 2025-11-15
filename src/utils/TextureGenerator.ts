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
    const generator = this.getTileGenerator(tileType);

    // Generate base texture
    const baseKey = `tile_${tileType}`;
    if (!scene.textures.exists(baseKey)) {
      const graphics = scene.add.graphics();
      generator(graphics, tileSize);
      graphics.generateTexture(baseKey, tileSize, tileSize);
      graphics.destroy();
    }

    // Generate variation textures (8 variations per tile type for more diversity)
    for (let variation = 0; variation < 8; variation++) {
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

      // Generate variations for this bitmask (8 variations for more diversity)
      for (let variation = 0; variation < 8; variation++) {
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

    // Add very subtle texture with variation-based positioning
    graphics.fillStyle(darkColor, 0.15);

    // Use variation to create different texture patterns
    const offsetX = ((variation * 3) % size) * 0.3;
    const offsetY = ((variation * 5) % size) * 0.3;
    graphics.fillRect(offsetX, offsetY, size / 3, size / 3);
    graphics.fillRect(size / 2 + offsetX, size / 2 + offsetY, size / 3, size / 3);

    // Add extremely subtle noise for texture depth with variation-based positions
    graphics.fillStyle(darkColor, 0.05);
    const noiseCount = 3 + (variation % 3); // 3-5 noise dots
    for (let i = 0; i < noiseCount; i++) {
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
    const darkColor = 0x555555;
    const lightColor = 0x999999;

    // Base fill
    graphics.fillStyle(baseColor);
    graphics.fillRect(0, 0, size, size);

    // Add very subtle darker texture with variation-based positioning
    graphics.fillStyle(darkColor, 0.15);
    const offsetX = ((variation * 3) % size) * 0.3;
    const offsetY = ((variation * 7) % size) * 0.3;
    graphics.fillRect(offsetX + 2, offsetY + 2, size / 3, size / 3);
    graphics.fillRect(size / 2 + offsetX, size / 2 + offsetY, size / 3, size / 3);

    // Add very subtle lighter highlights with variation-based positioning
    graphics.fillStyle(lightColor, 0.1);
    const highlightX = size / 2 + ((variation * 2) % size) * 0.2;
    const highlightY = size / 2 - ((variation * 4) % size) * 0.2;
    graphics.fillCircle(highlightX, highlightY, size / 5);

    // Add extremely subtle noise for texture depth with variation-based count
    graphics.fillStyle(darkColor, 0.05);
    const noiseCount = 3 + (variation % 3); // 3-5 noise dots
    for (let i = 0; i < noiseCount; i++) {
      const x = ((i * 11 + variation * 13) % size);
      const y = ((i * 17 + variation * 19) % size);
      graphics.fillCircle(x, y, 0.5);
    }
  }

  /**
   * Custom generator for ore tiles
   * Draws background tile (stone-like) with 2-3 ore nuggets
   */
  private static generateOreTile(
    graphics: Phaser.GameObjects.Graphics,
    size: number,
    variation: number = 0
  ): void {
    // Draw stone-like background with variation
    const baseColor = 0x777777;
    const darkColor = 0x555555;
    const lightColor = 0x999999;

    graphics.fillStyle(baseColor);
    graphics.fillRect(0, 0, size, size);

    // Add subtle stone texture with variation-based positioning
    graphics.fillStyle(darkColor, 0.15);
    const offsetX = ((variation * 3) % size) * 0.3;
    const offsetY = ((variation * 7) % size) * 0.3;
    graphics.fillRect(offsetX + 2, offsetY + 2, size / 3, size / 3);
    graphics.fillRect(size / 2 + offsetX, size / 2 + offsetY, size / 3, size / 3);

    graphics.fillStyle(lightColor, 0.1);
    const highlightX = size / 2 + ((variation * 2) % size) * 0.2;
    const highlightY = size / 2 - ((variation * 4) % size) * 0.2;
    graphics.fillCircle(highlightX, highlightY, size / 5);

    // Determine number of nuggets based on variation (2-3)
    const nuggetCount = 2 + (variation % 2); // variation 0,2,4,6 = 2 nuggets, variation 1,3,5,7 = 3 nuggets

    // Generate nugget positions that are spread out and not too close to edges
    const nuggetPositions = this.generateNuggetPositions(size, nuggetCount, variation);

    // Draw ore nuggets (larger size)
    const oreColor = 0xffd700;
    const oreDarkColor = 0xffaa00;

    nuggetPositions.forEach((pos, index) => {
      // Create slightly irregular oval shapes with larger base size
      const radiusX = 4 + (((index * 7 + variation * 11) % 10) / 10) * 3;
      const radiusY = 4 + (((index * 13 + variation * 17) % 10) / 10) * 3;

      // Draw main nugget
      graphics.fillStyle(oreColor);
      graphics.fillEllipse(pos.x, pos.y, radiusX, radiusY);

      // Add darker center for depth
      graphics.fillStyle(oreDarkColor, 0.5);
      graphics.fillEllipse(pos.x, pos.y, radiusX * 0.6, radiusY * 0.6);
    });
  }

  /**
   * Generate positions for ore nuggets that are spread out and not too close to edges
   */
  private static generateNuggetPositions(
    size: number,
    count: number,
    variation: number
  ): { x: number; y: number }[] {
    const positions: { x: number; y: number }[] = [];
    const minDistanceFromEdge = size * 0.2; // Keep nuggets at least 20% from edge
    const minDistanceBetween = size * 0.3; // Keep nuggets at least 30% apart

    // Create a grid-based approach with random offsets for even distribution
    const gridSize = Math.ceil(Math.sqrt(count));
    const cellSize = (size - 2 * minDistanceFromEdge) / gridSize;

    let nuggetIndex = 0;
    for (let i = 0; i < gridSize && nuggetIndex < count; i++) {
      for (let j = 0; j < gridSize && nuggetIndex < count; j++) {
        // Base position in grid cell
        const baseX = minDistanceFromEdge + i * cellSize + cellSize / 2;
        const baseY = minDistanceFromEdge + j * cellSize + cellSize / 2;

        // Add random offset within cell (using variation for deterministic randomness)
        const offsetX = ((nuggetIndex * 7 + variation * 11) % 100 - 50) / 100 * cellSize * 0.4;
        const offsetY = ((nuggetIndex * 13 + variation * 17) % 100 - 50) / 100 * cellSize * 0.4;

        const x = baseX + offsetX;
        const y = baseY + offsetY;

        // Check if position is valid (not too close to other nuggets)
        let validPosition = true;
        for (const existingPos of positions) {
          const distance = Math.sqrt(
            Math.pow(x - existingPos.x, 2) + Math.pow(y - existingPos.y, 2)
          );
          if (distance < minDistanceBetween) {
            validPosition = false;
            break;
          }
        }

        if (validPosition) {
          positions.push({ x, y });
          nuggetIndex++;
        }
      }
    }

    return positions;
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
