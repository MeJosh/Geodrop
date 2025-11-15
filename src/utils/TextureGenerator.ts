import Phaser from 'phaser';
import { TileType, TileRegistry } from '@/config/tiles';
import { WorldConfig } from '@/config/world';
import { PlayerConfig } from '@/config/player';

/**
 * Generates placeholder tileset textures programmatically
 * Used until we have actual sprite assets
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
    const tileSize = WorldConfig.tileWidth;
    const tileTypes = Object.values(TileType).filter((v) => typeof v === 'number') as TileType[];

    // Create a canvas for each tile type
    tileTypes.forEach((tileType) => {
      const tileDef = TileRegistry[tileType];
      const key = `tile_${tileType}`;

      // Skip if already exists
      if (scene.textures.exists(key)) {
        return;
      }

      // Create graphics object
      const graphics = scene.add.graphics();

      // Draw tile background
      graphics.fillStyle(tileDef.color);
      graphics.fillRect(0, 0, tileSize, tileSize);

      // Add some visual variety based on tile type
      if (tileType === TileType.DIRT) {
        // Add some dirt texture
        graphics.fillStyle(0x6b4423, 0.3);
        graphics.fillRect(0, 0, tileSize / 2, tileSize / 2);
        graphics.fillRect(tileSize / 2, tileSize / 2, tileSize / 2, tileSize / 2);
      } else if (tileType === TileType.STONE) {
        // Add some stone texture
        graphics.fillStyle(0x555555, 0.4);
        graphics.fillRect(4, 4, tileSize - 8, tileSize - 8);
        graphics.fillStyle(0x999999, 0.3);
        graphics.fillCircle(tileSize / 2, tileSize / 2, tileSize / 4);
      } else if (tileType === TileType.ORE) {
        // Add ore sparkles
        graphics.fillStyle(0xffaa00);
        graphics.fillCircle(tileSize / 4, tileSize / 4, 3);
        graphics.fillCircle((3 * tileSize) / 4, (3 * tileSize) / 4, 3);
        graphics.fillCircle((3 * tileSize) / 4, tileSize / 4, 2);
      } else if (tileType === TileType.BEDROCK) {
        // Add dark lines for bedrock
        graphics.lineStyle(2, 0x000000, 0.5);
        graphics.lineBetween(0, 0, tileSize, tileSize);
        graphics.lineBetween(tileSize, 0, 0, tileSize);
      }

      // Add border
      graphics.lineStyle(1, 0x000000, 0.2);
      graphics.strokeRect(0, 0, tileSize, tileSize);

      // Generate texture from graphics
      graphics.generateTexture(key, tileSize, tileSize);
      graphics.destroy();
    });

    console.log('[TextureGenerator] Generated tileset textures');
  }
}
