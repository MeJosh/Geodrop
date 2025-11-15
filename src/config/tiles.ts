/**
 * Tile type definitions and properties
 */
export enum TileType {
  EMPTY = 0,
  DIRT = 1,
  STONE = 2,
  ORE = 3,
  BEDROCK = 4,
}

export interface TileDefinition {
  id: TileType;
  name: string;
  type: 'empty' | 'dirt' | 'stone' | 'ore' | 'bedrock';
  hardness: number;
  solid: boolean;
  color: number; // Temporary color until we have textures
}

/**
 * Registry of all tile definitions
 */
export const TileRegistry: Record<TileType, TileDefinition> = {
  [TileType.EMPTY]: {
    id: TileType.EMPTY,
    name: 'Air',
    type: 'empty',
    hardness: 0,
    solid: false,
    color: 0x000000,
  },
  [TileType.DIRT]: {
    id: TileType.DIRT,
    name: 'Dirt',
    type: 'dirt',
    hardness: 1,
    solid: true,
    color: 0x8b5a3c,
  },
  [TileType.STONE]: {
    id: TileType.STONE,
    name: 'Stone',
    type: 'stone',
    hardness: 3,
    solid: true,
    color: 0x777777,
  },
  [TileType.ORE]: {
    id: TileType.ORE,
    name: 'Ore',
    type: 'ore',
    hardness: 5,
    solid: true,
    color: 0xffd700,
  },
  [TileType.BEDROCK]: {
    id: TileType.BEDROCK,
    name: 'Bedrock',
    type: 'bedrock',
    hardness: 999,
    solid: true,
    color: 0x222222,
  },
};
