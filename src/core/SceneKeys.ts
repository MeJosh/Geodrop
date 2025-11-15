/**
 * Scene key constants for managing Phaser scenes
 */
export const SceneKeys = {
  BOOT: 'BootScene',
  LOAD: 'LoadScene',
  MAIN: 'MainScene',
  UI: 'UIScene',
} as const;

export type SceneKey = (typeof SceneKeys)[keyof typeof SceneKeys];
