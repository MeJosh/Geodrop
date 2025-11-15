import Phaser from 'phaser';
import { GameConfig } from '@/config/game';
import { BootScene } from '@/scenes/BootScene';
import { LoadScene } from '@/scenes/LoadScene';
import { MainScene } from '@/scenes/MainScene';

/**
 * Main Game class - bootstraps and configures Phaser
 */
export class Game extends Phaser.Game {
  constructor() {
    const config: Phaser.Types.Core.GameConfig = {
      ...GameConfig,
      type: Phaser.AUTO,
      scene: [BootScene, LoadScene, MainScene],
    };

    super(config);

    console.log('[Game] GeoDrop initialized');
    console.log('[Game] Phaser version:', Phaser.VERSION);
  }
}
