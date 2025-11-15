import { TileType } from '@/config/tiles';

/**
 * Represents a single tile instance in the world
 */
export interface Tile {
  /** Tile type ID */
  type: TileType;
  /** World X coordinate (in tiles) */
  x: number;
  /** World Y coordinate (in tiles) */
  y: number;
  /** Current hardness (reduces as player mines) */
  hardness: number;
}

/**
 * Data structure for tile grid storage
 */
export type TileGrid = TileType[][];

/**
 * Tile position in grid coordinates
 */
export interface TilePosition {
  x: number;
  y: number;
}
