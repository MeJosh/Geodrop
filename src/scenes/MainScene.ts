import Phaser from 'phaser';
import { SceneKeys } from '@/core/SceneKeys';
import { WorldConfig } from '@/config/world';
import { TextureGenerator } from '@/utils/TextureGenerator';
import { GenerationSystem } from '@/systems/GenerationSystem';
import { TilemapSystem } from '@/systems/TilemapSystem';
import { PlayerSystem } from '@/systems/PlayerSystem';
import { InputSystem } from '@/systems/InputSystem';
import { MiningSystem } from '@/systems/MiningSystem';
import { TileType } from '@/config/tiles';

/**
 * MainScene - Main gameplay scene
 * Renders the world, handles player input, and manages game systems
 */
export class MainScene extends Phaser.Scene {
  private tilemapSystem?: TilemapSystem;
  private generationSystem?: GenerationSystem;
  private playerSystem?: PlayerSystem;
  private inputSystem?: InputSystem;
  private miningSystem?: MiningSystem;

  // Game stats
  private nuggetCount: number = 0;
  private currentDepth: number = 0;

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

    // Create mining system
    this.miningSystem = new MiningSystem(this, this.tilemapSystem);
    this.miningSystem.create();

    // Set camera bounds
    this.cameras.main.setBounds(0, 0, worldWidth, worldHeight);

    // Setup camera to follow player
    const playerSprite = this.playerSystem.getSprite();
    if (playerSprite) {
      this.cameras.main.startFollow(playerSprite, false, 0.1, 0.1);
      this.cameras.main.setDeadzone(200, 150);
    }

    // Update HTML UI with world seed
    if (typeof window !== 'undefined' && (window as any).setSeed) {
      (window as any).setSeed(this.generationSystem.getSeed());
    }
  }

  update(_time: number, delta: number): void {
    // Get player position first for input calculation
    if (!this.inputSystem || !this.playerSystem) return;

    const playerPos = this.playerSystem.getCenterPosition();

    // Get input (now with player position for touch/mouse controls)
    const input = this.inputSystem.getInput(playerPos.x, playerPos.y);

    // Update player with input
    this.playerSystem.update(input);

    // Update depth tracker based on player position
    this.updateDepthTracker(playerPos.y);

    // Update mining system
    if (this.miningSystem) {
      const playerState = this.playerSystem.getState();
      const miningResult = this.miningSystem.update(input, playerPos.x, playerPos.y, playerState.isGrounded, delta);

      // Check if a tile was broken and collect nuggets from ore
      if (miningResult && miningResult.broken && miningResult.tileType === TileType.ORE) {
        this.collectNuggets();
      }
    }
  }

  /**
   * Update the depth tracker based on player's Y position
   * Depth starts at 0 at the surface and increases going down
   */
  private updateDepthTracker(playerY: number): void {
    // Calculate depth in tiles (0 at surface, increases downward)
    const depthInTiles = Math.floor(playerY / WorldConfig.tileHeight);

    // Only update if depth changed
    if (depthInTiles !== this.currentDepth) {
      this.currentDepth = Math.max(0, depthInTiles); // Ensure depth is never negative

      // Update HTML UI
      if (typeof window !== 'undefined' && (window as any).updateDepth) {
        (window as any).updateDepth(this.currentDepth);
      }
    }
  }

  /**
   * Collect nuggets from mining ore
   * Auto-collects when ore tiles are mined
   */
  private collectNuggets(): void {
    // For now, each ore tile gives 1 nugget
    this.nuggetCount += 1;

    // Update HTML UI
    if (typeof window !== 'undefined' && (window as any).updateNuggets) {
      (window as any).updateNuggets(this.nuggetCount);
    }

    console.log(`[MainScene] Collected nugget! Total: ${this.nuggetCount}`);
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
