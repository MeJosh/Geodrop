import Phaser from 'phaser';
import { PlayerInput } from '@/types/PlayerTypes';

/**
 * InputSystem - Manages keyboard, mouse, and touch input for player controls
 */
export class InputSystem {
  private scene: Phaser.Scene;
  private cursors?: Phaser.Types.Input.Keyboard.CursorKeys;
  private wasd?: {
    W: Phaser.Input.Keyboard.Key;
    A: Phaser.Input.Keyboard.Key;
    S: Phaser.Input.Keyboard.Key;
    D: Phaser.Input.Keyboard.Key;
  };
  private spaceKey?: Phaser.Input.Keyboard.Key;

  // Touch/mouse state
  private isPointerDown: boolean = false;
  private pointerWorldX: number = 0;
  private pointerWorldY: number = 0;

  constructor(scene: Phaser.Scene) {
    this.scene = scene;
  }

  /**
   * Initialize input listeners
   */
  create(): void {
    const keyboard = this.scene.input.keyboard;
    if (!keyboard) {
      console.error('[InputSystem] Keyboard not available');
      return;
    }

    // Arrow keys
    this.cursors = keyboard.createCursorKeys();

    // WASD keys
    this.wasd = {
      W: keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.W),
      A: keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A),
      S: keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.S),
      D: keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D),
    };

    // Space for jump
    this.spaceKey = keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);

    // Mouse/touch input
    this.scene.input.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
      this.isPointerDown = true;
      this.updatePointerPosition(pointer);
    });

    this.scene.input.on('pointermove', (pointer: Phaser.Input.Pointer) => {
      if (this.isPointerDown) {
        this.updatePointerPosition(pointer);
      }
    });

    this.scene.input.on('pointerup', () => {
      this.isPointerDown = false;
    });

    console.log('[InputSystem] Input initialized (keyboard + mouse/touch)');
  }

  /**
   * Update pointer position in world coordinates
   */
  private updatePointerPosition(pointer: Phaser.Input.Pointer): void {
    this.pointerWorldX = pointer.worldX;
    this.pointerWorldY = pointer.worldY;
  }

  /**
   * Get current input state
   * @param playerX Player's center X position in world coordinates
   * @param playerY Player's center Y position in world coordinates
   */
  getInput(playerX: number = 0, playerY: number = 0): PlayerInput {
    if (!this.cursors || !this.wasd || !this.spaceKey) {
      return this.getEmptyInput();
    }

    // Start with keyboard input
    let isMovingLeft = this.cursors.left.isDown || this.wasd.A.isDown;
    let isMovingRight = this.cursors.right.isDown || this.wasd.D.isDown;
    let isMovingDown = this.cursors.down.isDown || this.wasd.S.isDown;
    let isJumping = this.cursors.up.isDown || this.wasd.W.isDown || this.spaceKey.isDown;

    // If pointer is down, calculate direction from player to pointer
    if (this.isPointerDown) {
      const direction = this.getPointerDirection(playerX, playerY);

      if (direction) {
        isMovingLeft = direction.left;
        isMovingRight = direction.right;
        isMovingDown = direction.down;
        isJumping = direction.up;
      }
    }

    return {
      left: isMovingLeft,
      right: isMovingRight,
      jump: isJumping,
      mineDown: isMovingDown,
      mineLeft: isMovingLeft,
      mineRight: isMovingRight,
    };
  }

  /**
   * Calculate the primary direction from player to pointer position
   * Returns the closest cardinal direction (up, down, left, right)
   */
  private getPointerDirection(playerX: number, playerY: number): {
    left: boolean;
    right: boolean;
    down: boolean;
    up: boolean;
  } | null {
    // Calculate vector from player to pointer
    const dx = this.pointerWorldX - playerX;
    const dy = this.pointerWorldY - playerY;

    // Calculate distance (to avoid processing very small movements)
    const distance = Math.sqrt(dx * dx + dy * dy);
    if (distance < 10) {
      // Too close to player, ignore
      return null;
    }

    // Determine primary direction based on which component is larger
    const absDx = Math.abs(dx);
    const absDy = Math.abs(dy);

    // Initialize all directions as false
    const direction = {
      left: false,
      right: false,
      down: false,
      up: false,
    };

    // Set the primary direction based on the largest component
    if (absDx > absDy) {
      // Horizontal is primary
      if (dx > 0) {
        direction.right = true;
      } else {
        direction.left = true;
      }
    } else {
      // Vertical is primary
      if (dy > 0) {
        direction.down = true;
      } else {
        direction.up = true;
      }
    }

    return direction;
  }

  /**
   * Get empty input state
   */
  private getEmptyInput(): PlayerInput {
    return {
      left: false,
      right: false,
      jump: false,
      mineDown: false,
      mineLeft: false,
      mineRight: false,
    };
  }
}
