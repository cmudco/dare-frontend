import { execFileSync } from 'node:child_process'
import {
  mkdtempSync,
  readFileSync,
  mkdirSync,
  copyFileSync,
  rmSync,
} from 'node:fs'
import { tmpdir } from 'node:os'
import { resolve, join } from 'node:path'
import { fileURLToPath } from 'node:url'
const root = fileURLToPath(new URL('..', import.meta.url))
const source = join(root, 'packages/chat-socket-contract')
const staging = mkdtempSync(join(tmpdir(), 'chat-contract-pack-'))
try {
  execFileSync('npm', ['test'], { cwd: source, stdio: 'inherit' })
  const [packed] = JSON.parse(
    execFileSync(
      'npm',
      ['pack', '--ignore-scripts', '--json', '--pack-destination', staging],
      { cwd: source, encoding: 'utf8' }
    )
  )
  for (const destination of [
    root,
    ...process.argv.slice(2).map((path) => resolve(path)),
  ]) {
    mkdirSync(join(destination, 'vendor'), { recursive: true })
    copyFileSync(
      join(staging, packed.filename),
      join(destination, 'vendor', packed.filename)
    )
    const manifest = JSON.parse(
      readFileSync(join(destination, 'package.json'), 'utf8')
    )
    if (!manifest.dependencies)
      throw new Error(`Not a frontend checkout: ${destination}`)
    execFileSync(
      'npm',
      [
        'install',
        '--ignore-scripts',
        '--no-audit',
        '--no-fund',
        `./vendor/${packed.filename}`,
      ],
      { cwd: destination, stdio: 'inherit' }
    )
  }
} finally {
  rmSync(staging, { recursive: true, force: true })
}
