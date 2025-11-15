import Phaser from 'phaser';
import { SceneKeys } from '@/core/SceneKeys';
import { WorldConfig } from '@/config/world';
import { TextureGenerator } from '@/utils/TextureGenerator';
import { GenerationSystem } from '@/systems/GenerationSystem';
import { TilemapSystem } from '@/systems/TilemapSystem';
import { PlayerSystem } from '@/systems/PlayerSystem';
import { InputSystem } from '@/systems/InputSystem';

/**
 * MainScene - Main gameplay scene
 * Renders the world, handles player input, and manages game systems
 */
export class MainScene extends Phaser.Scene {
  private tilemapSystem?: TilemapSystem;
  private generationSystem?: GenerationSystem;
  private playerSystem?: PlayerSystem;
  private inputSystem?: InputSystem;

  constructor() {
    super({ key: SceneKeys.MAIN });
  }

  create(): void {
    console.log('[MainScene] Starting game...');

    // Generate placeholder textures
    TextureGenerator.generateTileset(this);
    TextureGenerator.generatePlayerSprite(this);

    // Generate world
    this.generationSystem = new GenerationSystem();
    const worldData = this.generationSystem.generate();

    // Create tilemap system
    this.tilemapSystem = new TilemapSystem(this, worldData);
    this.tilemapSystem.create();

    // Create input system
    this.inputSystem = new InputSystem(this);
    this.inputSystem.create();

    // Set physics world bounds to match tilemap
    const worldWidth = WorldConfig.worldWidthInTiles * WorldConfig.tileWidth;
    const worldHeight = WorldConfig.worldHeightInTiles * WorldConfig.tileHeight;
    this.physics.world.setBounds(0, 0, worldWidth, worldHeight);

    // Create player system
    this.playerSystem = new PlayerSystem(this, this.tilemapSystem);
    this.playerSystem.create();

    // Set camera bounds
    this.cameras.main.setBounds(0, 0, worldWidth, worldHeight);

    // Setup camera to follow player
    const playerSprite = this.playerSystem.getSprite();
    if (playerSprite) {
      this.cameras.main.startFollow(playerSprite, false, 0.1, 0.1);
      this.cameras.main.setDeadzone(200, 150);
    }

    // Add title text
    const titleText = this.add.text(
      this.cameras.main.centerX,
      50,
      'GeoDrop - Phase 3 Complete!',
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
      'Arrow Keys / WASD: Move & Jump\nWorld Seed: ' + this.generationSystem.getSeed(),
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
    // Update player with input
    if (this.playerSystem && this.inputSystem) {
      const input = this.inputSystem.getInput();
      this.playerSystem.update(input);
    }
  }

  /**
   * Get the tilemap system
   */
  getTilemapSystem(): TilemapSystem | undefined {
    return this.tilemapSystem;
  }

  /**
   * Get the player system
   */
  getPlayerSystem(): PlayerSystem | undefined {
    return this.playerSystem;
  }
}
