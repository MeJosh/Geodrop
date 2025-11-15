/**
 * Mining-related type definitions
 */

/**
 * Direction the player is mining in
 */
export enum MiningDirection {
  DOWN = 'down',
  LEFT = 'left',
  RIGHT = 'right',
  NONE = 'none',
}

/**
 * State of an active mining operation
 */
export interface MiningState {
  isActive: boolean;
  targetX: number;
  targetY: number;
  direction: MiningDirection;
  progress: number; // 0-1, where 1 means tile is broken
  hardness: number; // Total hardness to overcome
}

/**
 * Result of a mining attempt
 */
export interface MiningResult {
  success: boolean;
  tileX: number;
  tileY: number;
  tileType: number;
  broken: boolean;
}
