import Phaser from 'phaser';
import { WorldConfig } from '@/config/world';
import { TileType, TileRegistry } from '@/config/tiles';
import { TileGrid } from '@/types/TileTypes';
import { WorldData } from '@/types/WorldTypes';

/**
 * TilemapSystem - Manages the game world tilemap
 * Handles rendering, collision, and tile updates
 */
export class TilemapSystem {
  private scene: Phaser.Scene;
  private worldData: WorldData;
  private tileSprites: Map<string, Phaser.GameObjects.Image> = new Map();
  private tilesContainer: Phaser.GameObjects.Container;

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

        // Create sprite for this tile
        const key = `tile_${tileType}`;
        const sprite = this.scene.add.image(
          x * tileWidth + tileWidth / 2,
          y * tileHeight + tileHeight / 2,
          key
        );
        sprite.setOrigin(0.5);

        // Store sprite reference
        this.tileSprites.set(`${x},${y}`, sprite);
        this.tilesContainer.add(sprite);
      }
    }
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

    // Update world data
    this.worldData.tiles[y][x] = TileType.EMPTY;

    return true;
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
