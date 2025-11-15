import Phaser from 'phaser';
import { SceneKeys } from '@/core/SceneKeys';

/**
 * LoadScene - Loads all game assets
 * Shows loading progress and transitions to MainScene when complete
 */
export class LoadScene extends Phaser.Scene {
  private loadingText?: Phaser.GameObjects.Text;
  private progressBar?: Phaser.GameObjects.Graphics;
  private progressBox?: Phaser.GameObjects.Graphics;

  constructor() {
    super({ key: SceneKeys.LOAD });
  }

  preload(): void {
    console.log('[LoadScene] Loading assets...');

    // Create loading UI
    this.createLoadingUI();

    // Set up loading event listeners
    this.load.on('progress', this.onProgress, this);
    this.load.on('complete', this.onComplete, this);

    // TODO: Load actual assets here when we have them
    // For now, we'll just simulate a brief load
    // this.load.image('player', 'assets/sprites/player.png');
    // this.load.spritesheet('tileset', 'assets/tilesets/tiles.png', {
    //   frameWidth: 32,
    //   frameHeight: 32,
    // });
  }

  create(): void {
    // Loading complete, transition to main scene after a brief delay
    this.time.delayedCall(500, () => {
      console.log('[LoadScene] Assets loaded, starting MainScene');
      this.scene.start(SceneKeys.MAIN);
    });
  }

  private createLoadingUI(): void {
    const width = this.cameras.main.width;
    const height = this.cameras.main.height;

    // Loading text
    this.loadingText = this.add.text(width / 2, height / 2 - 50, 'Loading...', {
      fontSize: '24px',
      color: '#ffffff',
      fontFamily: 'monospace',
    });
    this.loadingText.setOrigin(0.5);

    // Progress bar background
    this.progressBox = this.add.graphics();
    this.progressBox.fillStyle(0x222222, 0.8);
    this.progressBox.fillRect(width / 2 - 160, height / 2 - 10, 320, 30);

    // Progress bar fill
    this.progressBar = this.add.graphics();
  }

  private onProgress(value: number): void {
    const width = this.cameras.main.width;
    const height = this.cameras.main.height;

    // Update progress bar
    this.progressBar?.clear();
    this.progressBar?.fillStyle(0x00ff00, 1);
    this.progressBar?.fillRect(width / 2 - 150, height / 2, 300 * value, 10);

    // Update loading text
    this.loadingText?.setText(`Loading... ${Math.floor(value * 100)}%`);
  }

  private onComplete(): void {
    console.log('[LoadScene] Asset loading complete');
    this.progressBar?.destroy();
    this.progressBox?.destroy();
  }
}
