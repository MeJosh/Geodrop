import Phaser from 'phaser';
import { PlayerConfig } from '@/config/player';
import { WorldConfig } from '@/config/world';
import { PlayerState, PlayerInput } from '@/types/PlayerTypes';
import { TilemapSystem } from './TilemapSystem';

/**
 * PlayerSystem - Manages player sprite, physics, and movement
 */
export class PlayerSystem {
  private scene: Phaser.Scene;
  private sprite?: Phaser.Physics.Arcade.Sprite;
  private tilemapSystem: TilemapSystem;
  private state: PlayerState;

  constructor(scene: Phaser.Scene, tilemapSystem: TilemapSystem) {
    this.scene = scene;
    this.tilemapSystem = tilemapSystem;

    // Initialize state
    this.state = {
      x: 0,
      y: 0,
      velocityX: 0,
      velocityY: 0,
      isGrounded: false,
      isMoving: false,
      health: PlayerConfig.maxHealth,
    };
  }

  /**
   * Create player sprite with physics
   */
  create(): void {
    // Calculate spawn position in pixels
    const spawnX = PlayerConfig.startTileX * WorldConfig.tileWidth + WorldConfig.tileWidth / 2;
    const spawnY = PlayerConfig.startTileY * WorldConfig.tileHeight + WorldConfig.tileHeight / 2;

    // Create player sprite with arcade physics
    this.sprite = this.scene.physics.add.sprite(spawnX, spawnY, 'player');
    this.sprite.setOrigin(0.5);

    // Set physics body properties
    if (this.sprite.body) {
      const body = this.sprite.body as Phaser.Physics.Arcade.Body;

      // Set body size and offset for better collision
      body.setSize(PlayerConfig.bodyWidth, PlayerConfig.bodyHeight);
      body.setOffset(PlayerConfig.bodyOffsetX, PlayerConfig.bodyOffsetY);

      // Physics properties
      body.setGravityY(PlayerConfig.gravity);
      body.setDragX(PlayerConfig.drag);
      body.setMaxVelocity(PlayerConfig.moveSpeed * 2, PlayerConfig.maxFallSpeed);
      body.setCollideWorldBounds(true);
    }

    // Update initial state
    this.state.x = spawnX;
    this.state.y = spawnY;

    console.log('[PlayerSystem] Player created at', spawnX, spawnY);
  }

  /**
   * Update player based on input
   */
  update(input: PlayerInput): void {
    if (!this.sprite || !this.sprite.body) return;

    const body = this.sprite.body as Phaser.Physics.Arcade.Body;

    // Handle horizontal movement
    if (input.left) {
      body.setVelocityX(-PlayerConfig.moveSpeed);
      this.state.isMoving = true;
    } else if (input.right) {
      body.setVelocityX(PlayerConfig.moveSpeed);
      this.state.isMoving = true;
    } else {
      // Apply drag when no input
      body.setVelocityX(0);
      this.state.isMoving = false;
    }

    // Check tile collisions to update grounded state
    this.checkTileCollisions();

    // Handle jump (after collision check so we have accurate grounded state)
    if (input.jump && this.state.isGrounded) {
      body.setVelocityY(PlayerConfig.jumpVelocity);
    }

    // Update state
    this.state.x = this.sprite.x;
    this.state.y = this.sprite.y;
    this.state.velocityX = body.velocity.x;
    this.state.velocityY = body.velocity.y;
  }

  /**
   * Check for collisions with tiles
   */
  private checkTileCollisions(): void {
    if (!this.sprite || !this.sprite.body) return;

    const body = this.sprite.body as Phaser.Physics.Arcade.Body;

    // Get player bounds from body properties
    const left = body.x;
    const right = body.x + body.width;
    const top = body.y;
    const bottom = body.y + body.height;
    const centerX = body.x + body.width / 2;
    const centerY = body.y + body.height / 2;

    // Reset grounded state
    this.state.isGrounded = false;

    // Check if there's a solid tile just below the player (within 1 pixel and moving down or stationary)
    const feetY = Math.floor((bottom + 1) / WorldConfig.tileHeight);
    const leftFootX = Math.floor((left + 2) / WorldConfig.tileWidth);
    const rightFootX = Math.floor((right - 2) / WorldConfig.tileWidth);

    // Only consider grounded if we're moving down or nearly stationary vertically
    if (
      body.velocity.y >= -0.5 &&
      (this.tilemapSystem.isSolid(leftFootX, feetY) ||
        this.tilemapSystem.isSolid(rightFootX, feetY))
    ) {
      this.state.isGrounded = true;
    }

    // Get tile coordinates for player bounds
    const minTileX = Math.floor(left / WorldConfig.tileWidth);
    const maxTileX = Math.floor(right / WorldConfig.tileWidth);
    const minTileY = Math.floor(top / WorldConfig.tileHeight);
    const maxTileY = Math.floor(bottom / WorldConfig.tileHeight);

    // Find the tile with the most overlap to resolve (prevents fighting between multiple tiles)
    let maxOverlap = 0;
    let bestResolution: { dx: number; dy: number; stopVelocityX: boolean; stopVelocityY: boolean } | null = null;

    // Check all tiles player is overlapping
    for (let ty = minTileY; ty <= maxTileY; ty++) {
      for (let tx = minTileX; tx <= maxTileX; tx++) {
        if (this.tilemapSystem.isSolid(tx, ty)) {
          // Calculate tile bounds
          const tileLeft = tx * WorldConfig.tileWidth;
          const tileRight = tileLeft + WorldConfig.tileWidth;
          const tileTop = ty * WorldConfig.tileHeight;
          const tileBottom = tileTop + WorldConfig.tileHeight;

          // Calculate overlaps
          const overlapX = Math.min(right - tileLeft, tileRight - left);
          const overlapY = Math.min(bottom - tileTop, tileBottom - top);

          // Only consider if there's actual overlap (with small threshold to avoid jitter)
          if (overlapX > 0.5 && overlapY > 0.5) {
            const totalOverlap = overlapX * overlapY;

            // Only resolve the collision with the largest overlap area
            if (totalOverlap > maxOverlap) {
              maxOverlap = totalOverlap;

              // Determine resolution direction
              if (overlapX < overlapY) {
                // Resolve horizontally
                if (centerX < tileLeft + WorldConfig.tileWidth / 2) {
                  bestResolution = { dx: -overlapX, dy: 0, stopVelocityX: true, stopVelocityY: false };
                } else {
                  bestResolution = { dx: overlapX, dy: 0, stopVelocityX: true, stopVelocityY: false };
                }
              } else {
                // Resolve vertically
                if (centerY < tileTop + WorldConfig.tileHeight / 2) {
                  // Player is above tile (hitting ceiling)
                  bestResolution = { dx: 0, dy: -overlapY, stopVelocityX: false, stopVelocityY: true };
                } else {
                  // Player is below tile (standing on it)
                  bestResolution = { dx: 0, dy: overlapY, stopVelocityX: false, stopVelocityY: true };
                }
              }
            }
          }
        }
      }
    }

    // Apply the best resolution (only one per frame)
    if (bestResolution) {
      this.sprite.x += bestResolution.dx;
      this.sprite.y += bestResolution.dy;

      if (bestResolution.stopVelocityX) {
        body.setVelocityX(0);
      }
      if (bestResolution.stopVelocityY) {
        body.setVelocityY(0);
      }
    }
  }

  /**
   * Get player sprite
   */
  getSprite(): Phaser.Physics.Arcade.Sprite | undefined {
    return this.sprite;
  }

  /**
   * Get player state
   */
  getState(): PlayerState {
    return this.state;
  }

  /**
   * Get player position
   */
  getPosition(): { x: number; y: number } {
    return { x: this.state.x, y: this.state.y };
  }
}
