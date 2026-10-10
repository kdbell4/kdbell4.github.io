import { cpSync, readdirSync, rmSync } from 'node:fs';
import { join } from 'node:path';

// This repository's Pages source is main/(root). Keep generated files there.
for (const path of ['index.html', '_astro', 'ppg-vitals-monitor', 'hazard-detector', 'projects', '.nojekyll']) {
  rmSync(path, { recursive: true, force: true });
}

for (const entry of readdirSync('dist')) {
  cpSync(join('dist', entry), entry, { recursive: true });
}
