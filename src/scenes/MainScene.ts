import Phaser from 'phaser';
import { SceneKeys } from '@/core/SceneKeys';
import { WorldConfig } from '@/config/world';
import { TextureGenerator } from '@/utils/TextureGenerator';
import { GenerationSystem } from '@/systems/GenerationSystem';
import { TilemapSystem } from '@/systems/TilemapSystem';

/**
 * MainScene - Main gameplay scene
 * Renders the world, handles player input, and manages game systems
 */
export class MainScene extends Phaser.Scene {
  private tilemapSystem?: TilemapSystem;
  private generationSystem?: GenerationSystem;

  constructor() {
    super({ key: SceneKeys.MAIN });
  }

  create(): void {
    console.log('[MainScene] Starting game...');

    // Generate placeholder textures
    TextureGenerator.generateTileset(this);

    // Generate world
    this.generationSystem = new GenerationSystem();
    const worldData = this.generationSystem.generate();

    // Create tilemap system
    this.tilemapSystem = new TilemapSystem(this, worldData);
    this.tilemapSystem.create();

    // Set camera bounds
    this.cameras.main.setBounds(
      0,
      0,
      WorldConfig.worldWidthInTiles * WorldConfig.tileWidth,
      WorldConfig.worldHeightInTiles * WorldConfig.tileHeight
    );

    // Add title text
    const titleText = this.add.text(
      this.cameras.main.centerX,
      50,
      'GeoDrop - Phase 2 Complete!',
      {
        fontSize: '32px',
        color: '#00ff00',
        fontFamily: 'monospace',
        stroke: '#000000',
        strokeThickness: 4,
      }
    );
    titleText.setOrigin(0.5);
    titleText.setScrollFactor(0); // Fixed to camera

    // Add instructions
    const instructions = this.add.text(
      this.cameras.main.centerX,
      100,
      `Procedural World Generated!\nSeed: ${this.generationSystem.getSeed()}\nNext: Add player controls`,
      {
        fontSize: '16px',
        color: '#ffffff',
        fontFamily: 'monospace',
        align: 'center',
      }
    );
    instructions.setOrigin(0.5);
    instructions.setScrollFactor(0);
  }

  update(_time: number, _delta: number): void {
    // Game loop - will be used for systems updates
  }

  /**
   * Get the tilemap system
   */
  getTilemapSystem(): TilemapSystem | undefined {
    return this.tilemapSystem;
  }
}
