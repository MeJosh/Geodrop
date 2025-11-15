import Phaser from 'phaser';
import { SceneKeys } from '@/core/SceneKeys';

/**
 * BootScene - Initializes the game and performs minimal setup
 * This scene runs first and immediately transitions to LoadScene
 */
export class BootScene extends Phaser.Scene {
  constructor() {
    super({ key: SceneKeys.BOOT });
  }

  preload(): void {
    // Basic setup, no assets loaded here
    console.log('[BootScene] Initializing game...');
  }

  create(): void {
    console.log('[BootScene] Booting complete, starting LoadScene');
    this.scene.start(SceneKeys.LOAD);
  }
}
