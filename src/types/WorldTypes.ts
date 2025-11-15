import { TileGrid } from './TileTypes';

/**
 * Complete world data structure
 */
export interface WorldData {
  /** 2D array of tile type IDs */
  tiles: TileGrid;
  /** World width in tiles */
  width: number;
  /** World height in tiles */
  height: number;
  /** Generation seed used */
  seed: number;
}

/**
 * World generation parameters
 */
export interface GenerationParams {
  /** World width in tiles */
  width: number;
  /** World height in tiles */
  height: number;
  /** Random seed (0 = random) */
  seed?: number;
  /** Surface layer depth in tiles */
  surfaceDepth?: number;
  /** Dirt layer depth in tiles */
  dirtDepth?: number;
  /** Stone layer depth in tiles */
  stoneDepth?: number;
}
