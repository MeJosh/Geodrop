/**
 * Player state and data structures
 */

export interface PlayerState {
  /** Current X position in world (pixels) */
  x: number;
  /** Current Y position in world (pixels) */
  y: number;
  /** Current velocity X */
  velocityX: number;
  /** Current velocity Y */
  velocityY: number;
  /** Is player on ground */
  isGrounded: boolean;
  /** Is player moving */
  isMoving: boolean;
  /** Player health */
  health: number;
}

export interface PlayerInput {
  /** Move left */
  left: boolean;
  /** Move right */
  right: boolean;
  /** Jump */
  jump: boolean;
  /** Mine down */
  mineDown: boolean;
  /** Mine left */
  mineLeft: boolean;
  /** Mine right */
  mineRight: boolean;
}
