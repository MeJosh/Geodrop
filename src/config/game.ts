import Phaser from 'phaser';

/**
 * Core Phaser game configuration
 */
export const GameConfig = {
  width: 800,
  height: 600,
  backgroundColor: '#1a1a2e',
  pixelArt: true,
  roundPixels: true,
  antialias: false,
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { x: 0, y: 600 },
      debug: false,
    },
  },
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
  },
  parent: 'game-container',
} as const;
