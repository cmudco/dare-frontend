import { cp, mkdir, rm } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const docsSite = path.resolve(here, '..');
const frontendRoot = path.resolve(docsSite, '..');
const docsOut = path.join(docsSite, 'out');
const frontendDist = path.join(frontendRoot, 'dist');

await mkdir(frontendDist, { recursive: true });

await rm(path.join(frontendDist, 'docs'), { recursive: true, force: true });
await cp(path.join(docsOut, 'docs'), path.join(frontendDist, 'docs'), {
  recursive: true,
});

await rm(path.join(frontendDist, '_next'), { recursive: true, force: true });
await cp(path.join(docsOut, '_next'), path.join(frontendDist, '_next'), {
  recursive: true,
});

console.log('Copied docs static export into dist/docs and dist/_next');
