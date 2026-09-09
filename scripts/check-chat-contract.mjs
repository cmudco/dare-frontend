import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
const source = new URL('../packages/chat-socket-contract/', import.meta.url)
const installed = new URL(
  '../node_modules/@cmudco/chat-socket-contract/',
  import.meta.url
)
for (const file of [
  'package.json',
  'src/index.ts',
  'dist/index.js',
  'dist/index.d.ts',
  'fixtures.json',
  'conformance.mjs',
  'README.md',
]) {
  assert.equal(
    readFileSync(new URL(file, source), 'utf8'),
    readFileSync(new URL(file, installed), 'utf8'),
    `${file} differs from installed archive; run scripts/pack-chat-contract.mjs`
  )
}
console.log(
  `Shared contract source and installed artifact agree: ${fileURLToPath(source)}`
)
