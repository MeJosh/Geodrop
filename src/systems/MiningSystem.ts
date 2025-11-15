import Phaser from 'phaser';
import { MiningConfig } from '@/config/mining';
import { WorldConfig } from '@/config/world';
import { TileRegistry } from '@/config/tiles';
import { MiningState, MiningDirection, MiningResult } from '@/types/MiningTypes';
import { PlayerInput } from '@/types/PlayerTypes';
import { TilemapSystem } from './TilemapSystem';

/**
 * MiningSystem - Handles tile destruction mechanics
 */
export class MiningSystem {
  private scene: Phaser.Scene;
  private tilemapSystem: TilemapSystem;
  private state: MiningState;

  // Visual elements
  private targetIndicator?: Phaser.GameObjects.Rectangle;
  private progressBar?: Phaser.GameObjects.Graphics;

  // Cooldown tracking
  private landingCooldownTimer: number = 0;
  private wasGroundedLastFrame: boolean = false;

  constructor(scene: Phaser.Scene, tilemapSystem: TilemapSystem) {
    this.scene = scene;
    this.tilemapSystem = tilemapSystem;

    // Initialize mining state
    this.state = {
      isActive: false,
      targetX: -1,
      targetY: -1,
      direction: MiningDirection.NONE,
      progress: 0,
      hardness: 0,
    };
  }

  /**
   * Create visual elements for mining feedback
   */
  create(): void {
    // Create target tile indicator (yellow overlay)
    this.targetIndicator = this.scene.add.rectangle(
      0,
      0,
      WorldConfig.tileWidth,
      WorldConfig.tileHeight,
      MiningConfig.indicatorColor,
      MiningConfig.indicatorAlpha
    );
    this.targetIndicator.setOrigin(0.5);
    this.targetIndicator.setVisible(false);

    // Create progress bar graphics
    this.progressBar = this.scene.add.graphics();
    this.progressBar.setDepth(100);

    console.log('[MiningSystem] Mining system created');
  }

  /**
   * Update mining state based on player input and position
   */
  update(
    input: PlayerInput,
    playerX: number,
    playerY: number,
    isGrounded: boolean,
    delta: number
  ): MiningResult | null {
    // Update cooldown timer
    if (this.landingCooldownTimer > 0) {
      this.landingCooldownTimer -= delta;
    }

    // Detect landing (transition from not grounded to grounded)
    if (!this.wasGroundedLastFrame && isGrounded) {
      this.landingCooldownTimer = MiningConfig.landingCooldown;
    }
    this.wasGroundedLastFrame = isGrounded;

    // Determine mining direction from input
    const direction = this.getMiningDirection(input);

    // If no mining input, reset state
    if (direction === MiningDirection.NONE) {
      this.resetMining();
      return null;
    }

    // Can only mine when grounded and cooldown has expired
    if (!isGrounded || this.landingCooldownTimer > 0) {
      this.resetMining();
      return null;
    }

    // Calculate target tile coordinates
    const targetTile = this.getTargetTile(playerX, playerY, direction);
    if (!targetTile) {
      this.resetMining();
      return null;
    }

    const { tileX, tileY } = targetTile;

    // Check if tile is mineable
    const tileType = this.tilemapSystem.getTileAt(tileX, tileY);
    if (tileType === null) {
      this.resetMining();
      return null;
    }

    const tileDef = TileRegistry[tileType];
    if (!tileDef.solid) {
      this.resetMining();
      return null;
    }

    // If we're mining a new tile, reset progress
    if (!this.state.isActive || this.state.targetX !== tileX || this.state.targetY !== tileY) {
      this.startMining(tileX, tileY, direction, tileDef.hardness);
    }

    // Update mining progress
    const deltaSeconds = delta / 1000;
    this.state.progress += (MiningConfig.miningSpeed / this.state.hardness) * deltaSeconds;

    // Update visual indicator
    this.updateVisuals(tileX, tileY);

    // Check if tile is broken
    if (this.state.progress >= 1.0) {
      const result = this.breakTile(tileX, tileY, tileType);
      this.resetMining();
      return result;
    }

    return null;
  }

  /**
   * Get mining direction from input
   */
  private getMiningDirection(input: PlayerInput): MiningDirection {
    if (input.mineDown) return MiningDirection.DOWN;
    if (input.mineLeft) return MiningDirection.LEFT;
    if (input.mineRight) return MiningDirection.RIGHT;
    return MiningDirection.NONE;
  }

  /**
   * Calculate target tile coordinates based on player position and mining direction
   */
  private getTargetTile(
    playerX: number,
    playerY: number,
    direction: MiningDirection
  ): { tileX: number; tileY: number } | null {
    // First, get the tile the player is currently in
    const playerTileX = Math.floor(playerX / WorldConfig.tileWidth);
    const playerTileY = Math.floor(playerY / WorldConfig.tileHeight);

    // Then offset by one tile in the mining direction
    let targetTileX = playerTileX;
    let targetTileY = playerTileY;

    switch (direction) {
      case MiningDirection.DOWN:
        targetTileY += 1;
        break;
      case MiningDirection.LEFT:
        targetTileX -= 1;
        break;
      case MiningDirection.RIGHT:
        targetTileX += 1;
        break;
      default:
        return null;
    }

    return { tileX: targetTileX, tileY: targetTileY };
  }

  /**
   * Start mining a new tile
   */
  private startMining(tileX: number, tileY: number, direction: MiningDirection, hardness: number): void {
    this.state = {
      isActive: true,
      targetX: tileX,
      targetY: tileY,
      direction,
      progress: 0,
      hardness,
    };

    console.log(`[MiningSystem] Started mining tile at (${tileX}, ${tileY}) with hardness ${hardness}`);
  }

  /**
   * Break a tile and remove it from the tilemap
   */
  private breakTile(tileX: number, tileY: number, tileType: number): MiningResult {
    const success = this.tilemapSystem.destroyTile(tileX, tileY);

    console.log(`[MiningSystem] Broke tile at (${tileX}, ${tileY}), type: ${tileType}`);

    return {
      success,
      tileX,
      tileY,
      tileType,
      broken: true,
    };
  }

  /**
   * Reset mining state
   */
  private resetMining(): void {
    this.state.isActive = false;
    this.state.progress = 0;
    this.state.direction = MiningDirection.NONE;

    // Hide visual elements
    if (this.targetIndicator) {
      this.targetIndicator.setVisible(false);
    }
    if (this.progressBar) {
      this.progressBar.clear();
    }
  }

  /**
   * Update visual indicators
   */
  private updateVisuals(tileX: number, tileY: number): void {
    if (!this.targetIndicator || !this.progressBar) return;

    // Position target indicator on the tile
    const worldX = tileX * WorldConfig.tileWidth + WorldConfig.tileWidth / 2;
    const worldY = tileY * WorldConfig.tileHeight + WorldConfig.tileHeight / 2;

    this.targetIndicator.setPosition(worldX, worldY);
    this.targetIndicator.setVisible(true);

    // Draw progress bar above the tile
    this.progressBar.clear();

    const barWidth = WorldConfig.tileWidth - 4;
    const barHeight = MiningConfig.progressBarHeight;
    const barX = worldX - barWidth / 2;
    const barY = worldY - WorldConfig.tileHeight / 2 - barHeight - 2;

    // Background
    this.progressBar.fillStyle(MiningConfig.progressBarBackgroundColor);
    this.progressBar.fillRect(barX, barY, barWidth, barHeight);

    // Progress
    this.progressBar.fillStyle(MiningConfig.progressBarColor);
    this.progressBar.fillRect(barX, barY, barWidth * this.state.progress, barHeight);
  }

  /**
   * Get current mining state
   */
  getState(): MiningState {
    return this.state;
  }

  /**
   * Clean up resources
   */
  destroy(): void {
    if (this.targetIndicator) {
      this.targetIndicator.destroy();
    }
    if (this.progressBar) {
      this.progressBar.destroy();
    }
  }
}
