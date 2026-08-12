#!/usr/bin/env node
/*
 * Rasterise the PWA icons from public/icon-maskable.svg.
 *
 * The PNGs are committed, but they are generated rather than hand-made so the
 * mark stays the single source of truth: change the SVG, run `npm run icons`,
 * commit the result. Android and desktop Chrome accept the SVG directly; iOS
 * still wants a PNG apple-touch-icon, which is why these exist at all.
 */
import { mkdir } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import sharp from 'sharp'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const source = path.join(root, 'public', 'icon-maskable.svg')
const outDir = path.join(root, 'public', 'icons')

const TARGETS = [
  { file: 'icon-192.png', size: 192 },
  { file: 'icon-512.png', size: 512 },
  // iOS composites onto its own rounded mask and never honours transparency,
  // so this one is the same full-bleed artwork at Apple's expected size.
  { file: 'apple-touch-icon.png', size: 180 },
]

await mkdir(outDir, { recursive: true })

for (const { file, size } of TARGETS) {
  const out = path.join(outDir, file)
  await sharp(source, { density: 384 })
    .resize(size, size, { fit: 'cover' })
    .png({ compressionLevel: 9 })
    .toFile(out)
  console.log(`  ${file}  ${size}x${size}`)
}

console.log(`\nWrote ${TARGETS.length} icons to public/icons/`)
