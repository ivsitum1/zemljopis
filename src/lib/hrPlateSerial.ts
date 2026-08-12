/** Latin letters used on standard HR serials (excludes Q, W, X, Y). */
const LETTERS = 'ABCDEFGHIJKLMNOPRSTUVZ'

/**
 * Simulate a Croatian civil plate serial: NNN-L | NNN-LL | NNNN-L | NNNN-LL.
 * @param rng — values in [0, 1), defaults to Math.random
 */
export function simulateHrSerial(rng: () => number = Math.random): string {
  const digitCount = rng() < 0.5 ? 3 : 4
  const letterCount = rng() < 0.5 ? 1 : 2
  let digits = ''
  for (let i = 0; i < digitCount; i += 1) {
    digits += Math.floor(rng() * 10).toString()
  }
  let letters = ''
  for (let i = 0; i < letterCount; i += 1) {
    letters += LETTERS[Math.floor(rng() * LETTERS.length)]!
  }
  return `${digits}-${letters}`
}
