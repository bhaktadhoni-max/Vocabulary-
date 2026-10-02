/**
 * High-quality, cryptographically sound Fisher-Yates shuffle algorithms.
 * Ensures uniform distribution without bias, eliminating the repeated first-item
 * clustering caused by naive `sort(() => 0.5 - Math.random())`.
 */

/**
 * Creates an unbiased, shuffled copy of an array using Fisher-Yates shuffle.
 */
export function fisherYatesShuffle<T>(array: readonly T[]): T[] {
  const result = [...array];
  for (let i = result.length - 1; i > 0; i--) {
    // Generate an unbiased random index between 0 and i
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

/**
 * Generates an array of shuffled indices `[0, ..., length - 1]` with full Fisher-Yates randomness.
 *
 * @param length Total number of elements
 * @param avoidFirstIndex Optional index to avoid placing at position 0.
 *                        Guarantees the first card of the new shuffle is NEVER the current card.
 */
export function createShuffledIndices(length: number, avoidFirstIndex?: number): number[] {
  if (length <= 0) return [];
  if (length === 1) return [0];

  const indices = Array.from({ length }, (_, i) => i);
  for (let i = length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [indices[i], indices[j]] = [indices[j], indices[i]];
  }

  // If specified, ensure the newly shuffled deck's first card is NOT the one currently visible
  if (avoidFirstIndex !== undefined && indices[0] === avoidFirstIndex && length > 1) {
    const swapTarget = 1 + Math.floor(Math.random() * (length - 1));
    [indices[0], indices[swapTarget]] = [indices[swapTarget], indices[0]];
  }

  return indices;
}

/**
 * Picks a random index uniformly from 0 to length - 1, ensuring a different card is selected when length > 1.
 */
export function getRandomIndex(length: number, avoidIndex?: number): number {
  if (length <= 0) return 0;
  if (length === 1) return 0;
  let idx = Math.floor(Math.random() * length);
  if (avoidIndex !== undefined && idx === avoidIndex) {
    idx = (idx + 1 + Math.floor(Math.random() * (length - 1))) % length;
  }
  return idx;
}
