# Techincal Design Document — GeoDrop — 2D Procedurally Generated Mining Game

## 1. Overview

This document describes the design goals, system architecture, and technical implementation strategy for a **2D scrolling mining game** built using:

- **Phaser 3**
- **TypeScript**
- **Vite** (dev/build tooling)
- **GitHub Pages** (static hosting)
- **Modular ECS-inspired game systems**

The player begins at the top of a procedurally generated level and digs downward toward a hidden exit. The world is tile-based, retro-styled, destructible, and scrolls vertically as the player mines.

---

## 2. High-Level Objectives

### 2.1 Core Gameplay Objective
Create a replayable 2D mining experience where the player:

- Starts at the surface
- Mines downward through destructible terrain
- Manages hazards, physics, gravity, and resources
- Reaches a goal at the bottom of the world
- Encounters procedural terrain variation each run

### 2.2 Non-Functional Objectives
- **Performance:** Smooth 60 FPS on browser using Canvas/WebGL.
- **Static Hosting:** Runs on GitHub Pages without a backend.
- **Maintainability:** Modular TypeScript architecture; systems isolated; clear directory structure.
- **Modifiability:** Level generation, tile definitions, and sprite assets easy to extend.
- **LLM-Assistant Friendly:** Code structure and technical detail designed so a code-editor AI can safely generate files.

---

## 3. Design Goals

### 3.1 2D Retro Aesthetic
- Pixelated tiles (16×16 or 32×32).
- No smoothing on scaled images.
- Limited color palette for retro feel.

### 3.2 Simple but Satisfying Physics
- Player uses **Arcade Physics**: gravity, velocity, collision.
- Breaking tiles triggers small particle effects (optional).
- Falling blocks or hazards use simplified physics behaviors.

### 3.3 Procedural World Generation
- Chunk-based generation (e.g., 16×64 columns per chunk).
- Dirt/stone layers vary with depth.
- Rare features: ores, caves, hazards, structures.
- Guarantee solvable downward path.

### 3.4 Clean, Modular Code Structure
- Game logic separated from rendering.
- Systems for generating terrain, handling player input, updating camera, collisions, and tile destruction.
- Files organized to make AI-assisted editing predictable.

---

## 4. System Architecture

### 4.1 Directory Structure

```
/src
  /assets
    /tilesets
    /sprites
    /maps (optional pre-generated)
  /config
    tiles.ts
    world.ts
    game.ts
  /core
    Game.ts
    SceneKeys.ts
  /scenes
    BootScene.ts
    LoadScene.ts
    MainScene.ts
    UIScene.ts
  /systems
    PlayerSystem.ts
    TilemapSystem.ts
    MiningSystem.ts
    CameraSystem.ts
    PhysicsSystem.ts
    InputSystem.ts
    GenerationSystem.ts
  /types
    TileTypes.ts
    WorldTypes.ts
    PlayerTypes.ts
  /utils
    RNG.ts
    Math.ts
    Assets.ts
index.html
vite.config.ts
```

---

## 5. Gameplay Systems

### 5.1 Player System

**Responsibilities:**
- Create and manage player sprite + physics body.
- Handle movement (left/right/jump).
- Handle collision with world tiles.
- Interface with **MiningSystem** for tile destruction.

**Components:**
- `PlayerState` (position, velocity, inventory).
- `PlayerController` (input mapping).
- `PlayerPhysics` (gravity, acceleration, drag).

**Key Features:**
- Player can only dig downward or sideways tiles.
- Mining is triggered by input + collision direction.

---

### 5.2 Tilemap / Terrain System

**Responsibilities:**
- Store tilemap layers.
- Handle destructible tiles.
- Update tile states after mining.
- Provide collision metadata to physics engine.

**Tile Data Structure:**

```ts
interface TileDefinition {
  id: number;
  type: 'dirt' | 'stone' | 'ore' | 'empty';
  hardness: number;
  solid: boolean;
  texture: string;
}
```

**Map Representation:**
- A 2D integer array representing tile IDs.
- Converted to Phaser tilemap on scene load.

---

### 5.3 Mining System

**Responsibilities:**
- Translate player input into mining attempts.
- Check target tile coordinates.
- Reduce hardness; remove tile when broken.
- Trigger particle effects.

**Algorithm Outline:**

1. Determine tile adjacent in direction of input.
2. Check if tile is destructible.
3. Apply mining strength per tick.
4. Replace tile with `TileType.EMPTY`.
5. Update tilemap layer.

---

### 5.4 Procedural Generation System

**Responsibilities:**
- Generate tile IDs for entire world or by chunks.
- Difficulty curve: deeper levels increase stone hardness.
- Random veins of resources.
- Cave pockets and air pockets.
- Guarantee downward path access.

**Chunk Generator Pseudocode:**

```ts
function generateChunk(chunkY: number): number[][] {
  const chunk: number[][] = [];

  for (let y = 0; y < CHUNK_HEIGHT; y++) {
    const row = [];
    for (let x = 0; x < WORLD_WIDTH; x++) {
      row.push(generateTileForDepth(chunkY * CHUNK_HEIGHT + y));
    }
    chunk.push(row);
  }

  return chunk;
}
```

**World Options:**
- Full world generated upfront (simplest).
- Chunk streaming as player descends (more scalable).

---

## 5.5 Camera System

**Responsibilities:**
- Follow player vertically.
- Lock horizontally to world bounds.
- Apply smooth lerp for polished movement.

**Behavior:**
- Camera always centers a few tiles above player.
- As player descends, camera reveals new terrain.

---

## 5.6 Physics System

**Responsibilities:**
- Configure and manage Arcade Physics settings.
- Enable collision between player + terrain tiles.
- Handle physics updates each tick.

---

## 5.7 Input System

**Responsibilities:**
- Map keys to player actions.
- Support touch input (optional future feature).
- Provide clean event bindings.

---

## 6. Asset Pipeline

### 6.1 Sprite & Tileset Format
- Use spritesheets and a tileset atlas (PNG).
- Tile sizes consistent: 16×16 or 32×32.

### 6.2 Loading Strategy
- `BootScene` loads bare minimum.
- `LoadScene` loads all assets.
- `MainScene` starts the game.

---

## 7. Build & Deployment

### 7.1 Vite Build

```
npm run build
```

### 7.2 GitHub Pages

Set Vite base path:

```ts
export default defineConfig({
  base: '/my-mining-game/',
});
```

---

## 8. Future Enhancements

- Lighting system (fake 2D light around player).
- Tools upgrades.
- Enemies or falling hazards.
- Inventory and crafting.
- Multiple biomes.
- Daily seed sharing.
