import Phaser from 'phaser';
import { WorldConfig } from '@/config/world';
import { TileType, TileRegistry } from '@/config/tiles';
import { TileGrid } from '@/types/TileTypes';
import { WorldData } from '@/types/WorldTypes';
import { TextureGenerator } from '@/utils/TextureGenerator';

/**
 * TilemapSystem - Manages the game world tilemap
 * Handles rendering, collision, and tile updates
 */
export class TilemapSystem {
  private scene: Phaser.Scene;
  private worldData: WorldData;
  private tileSprites: Map<string, Phaser.GameObjects.Image> = new Map();
  private tilesContainer: Phaser.GameObjects.Container;
  private tileVariations: Map<string, number> = new Map(); // Store random variations per tile

  constructor(scene: Phaser.Scene, worldData: WorldData) {
    this.scene = scene;
    this.worldData = worldData;
    this.tilesContainer = scene.add.container(0, 0);
  }

  /**
   * Initialize the tilemap and create the visual representation
   */
  create(): void {
    const { tiles } = this.worldData;

    // Populate the tilemap with world data
    this.populateTilemap(tiles);

    console.log('[TilemapSystem] Tilemap created');
  }

  /**
   * Populate the tilemap with tile data using sprites
   */
  private populateTilemap(tiles: TileGrid): void {
    const { tileWidth, tileHeight } = WorldConfig;

    for (let y = 0; y < tiles.length; y++) {
      for (let x = 0; x < tiles[y].length; x++) {
        const tileType = tiles[y][x];

        // Skip empty tiles
        if (tileType === TileType.EMPTY) continue;

        // Create sprite for this tile with appropriate texture
        this.createTileSprite(x, y, tileType);
      }
    }
  }

  /**
   * Create a tile sprite with connected textures and variations
   */
  private createTileSprite(x: number, y: number, tileType: TileType): void {
    // Generate random variation for this tile (0-7 for more diversity)
    const variation = Math.floor(Math.random() * 8);
    this.createTileSpriteWithVariation(x, y, tileType, variation);
  }

  /**
   * Create a tile sprite with a specific variation (used when preserving appearance)
   */
  private createTileSpriteWithVariation(x: number, y: number, tileType: TileType, variation: number): void {
    const { tileWidth, tileHeight } = WorldConfig;
    const tileDef = TileRegistry[tileType];

    // Store the variation
    this.tileVariations.set(`${x},${y}`, variation);

    // Get texture key based on whether it uses connected textures
    let textureKey: string;
    if (tileDef.connectedTexture) {
      // Calculate bitmask based on neighbors
      const bitmask = TextureGenerator.calculateBitmask(x, y, (nx, ny) => {
        return this.shouldConnect(nx, ny, tileType);
      });
      textureKey = `tile_${tileType}_${bitmask}_var${variation}`;
    } else {
      textureKey = `tile_${tileType}_var${variation}`;
    }

    // Create sprite
    const sprite = this.scene.add.image(
      x * tileWidth + tileWidth / 2,
      y * tileHeight + tileHeight / 2,
      textureKey
    );
    sprite.setOrigin(0.5);

    // Store sprite reference
    this.tileSprites.set(`${x},${y}`, sprite);
    this.tilesContainer.add(sprite);
  }

  /**
   * Check if a neighbor tile should connect to the given tile type
   */
  private shouldConnect(x: number, y: number, sourceTileType: TileType): boolean {
    const neighborType = this.getTileAt(x, y);
    if (neighborType === null) return false;

    // Get tile definitions
    const sourcesDef = TileRegistry[sourceTileType];
    const neighborDef = TileRegistry[neighborType];

    // Both tiles must be solid to connect
    if (!sourcesDef.solid || !neighborDef.solid) return false;

    // Allow different types to connect if both use connected textures
    // This creates smooth blending between different solid tile types
    return sourcesDef.connectedTexture || neighborDef.connectedTexture;
  }

  /**
   * Destroy a tile at the given position
   */
  destroyTile(x: number, y: number): boolean {
    // Check bounds
    if (x < 0 || y < 0 || x >= this.worldData.width || y >= this.worldData.height) {
      return false;
    }

    // Get tile sprite
    const key = `${x},${y}`;
    const sprite = this.tileSprites.get(key);
    if (!sprite) return false;

    // Remove sprite
    sprite.destroy();
    this.tileSprites.delete(key);
    this.tileVariations.delete(key);

    // Update world data
    this.worldData.tiles[y][x] = TileType.EMPTY;

    // Update neighboring connected textures
    this.updateNeighborConnections(x, y);

    return true;
  }

  /**
   * Update connected textures for neighboring tiles
   */
  private updateNeighborConnections(centerX: number, centerY: number): void {
    // Check all 8 neighbors
    const neighbors = [
      { x: centerX - 1, y: centerY - 1 }, // NW
      { x: centerX, y: centerY - 1 },     // N
      { x: centerX + 1, y: centerY - 1 }, // NE
      { x: centerX - 1, y: centerY },     // W
      { x: centerX + 1, y: centerY },     // E
      { x: centerX - 1, y: centerY + 1 }, // SW
      { x: centerX, y: centerY + 1 },     // S
      { x: centerX + 1, y: centerY + 1 }, // SE
    ];

    neighbors.forEach(({ x, y }) => {
      const tileType = this.getTileAt(x, y);
      if (tileType === null || tileType === TileType.EMPTY) return;

      const tileDef = TileRegistry[tileType];
      if (!tileDef.connectedTexture) return;

      // Recreate the sprite with updated connections, preserving the variation
      const key = `${x},${y}`;
      const existingSprite = this.tileSprites.get(key);
      if (existingSprite) {
        existingSprite.destroy();
        this.tileSprites.delete(key);
      }

      // Preserve the existing variation (or use existing one if already stored)
      const existingVariation = this.tileVariations.get(key);
      if (existingVariation !== undefined) {
        // Use the existing variation to maintain consistent appearance
        this.createTileSpriteWithVariation(x, y, tileType, existingVariation);
      } else {
        this.createTileSprite(x, y, tileType);
      }
    });
  }

  /**
   * Get tile type at position
   */
  getTileAt(x: number, y: number): TileType | null {
    if (x < 0 || y < 0 || x >= this.worldData.width || y >= this.worldData.height) {
      return null;
    }
    return this.worldData.tiles[y][x];
  }

  /**
   * Check if tile at position is solid
   */
  isSolid(x: number, y: number): boolean {
    const tileType = this.getTileAt(x, y);
    if (tileType === null) return false;

    const tileDef = TileRegistry[tileType];
    return tileDef.solid;
  }

  /**
   * Get world data
   */
  getWorldData(): WorldData {
    return this.worldData;
  }

  /**
   * Get tiles container for physics
   */
  getContainer(): Phaser.GameObjects.Container {
    return this.tilesContainer;
  }
}
