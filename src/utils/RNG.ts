/**
 * Simple seeded random number generator
 * Uses a Linear Congruential Generator (LCG) algorithm
 */
export class RNG {
  private seed: number;
  private current: number;

  constructor(seed?: number) {
    this.seed = seed ?? Date.now();
    this.current = this.seed;
  }

  /**
   * Get next random float between 0 and 1
   */
  next(): number {
    // LCG parameters (from Numerical Recipes)
    const a = 1664525;
    const c = 1013904223;
    const m = 2 ** 32;

    this.current = (a * this.current + c) % m;
    return this.current / m;
  }

  /**
   * Get random integer between min (inclusive) and max (exclusive)
   */
  nextInt(min: number, max: number): number {
    return Math.floor(this.next() * (max - min)) + min;
  }

  /**
   * Get random float between min and max
   */
  nextFloat(min: number, max: number): number {
    return this.next() * (max - min) + min;
  }

  /**
   * Get random boolean with given probability (0-1)
   */
  nextBool(probability = 0.5): boolean {
    return this.next() < probability;
  }

  /**
   * Get the current seed
   */
  getSeed(): number {
    return this.seed;
  }

  /**
   * Reset to initial seed
   */
  reset(): void {
    this.current = this.seed;
  }
}
