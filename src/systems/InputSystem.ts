import Phaser from 'phaser';
import { PlayerInput } from '@/types/PlayerTypes';

/**
 * InputSystem - Manages keyboard input for player controls
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

    console.log('[InputSystem] Input initialized');
  }

  /**
   * Get current input state
   */
  getInput(): PlayerInput {
    if (!this.cursors || !this.wasd || !this.spaceKey) {
      return this.getEmptyInput();
    }

    // Movement is exclusive with mining
    const isMovingLeft = this.cursors.left.isDown || this.wasd.A.isDown;
    const isMovingRight = this.cursors.right.isDown || this.wasd.D.isDown;
    const isMovingDown = this.cursors.down.isDown || this.wasd.S.isDown;

    return {
      left: isMovingLeft,
      right: isMovingRight,
      jump: this.cursors.up.isDown || this.wasd.W.isDown || this.spaceKey.isDown,
      mineDown: isMovingDown,
      mineLeft: isMovingLeft,
      mineRight: isMovingRight,
    };
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
