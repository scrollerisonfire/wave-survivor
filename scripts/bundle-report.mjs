// Performance budget: prints build output sizes and fails CI if gzipped JS grows past the budget.
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { gzipSync } from 'node:zlib';
import { join } from 'node:path';

const BUDGET_GZIP_KB = 300;
const dir = 'dist/assets';
let jsGzip = 0;

for (const file of readdirSync(dir)) {
  const path = join(dir, file);
  const raw = statSync(path).size;
  const gz = gzipSync(readFileSync(path)).length;
  if (file.endsWith('.js')) jsGzip += gz;
  console.log(
    `${file.padEnd(36)} ${(raw / 1024).toFixed(1).padStart(8)} KB  ${(gz / 1024).toFixed(1).padStart(8)} KB gzip`,
  );
}

const kb = jsGzip / 1024;
console.log(`\nJS total: ${kb.toFixed(1)} KB gzip (budget ${BUDGET_GZIP_KB} KB)`);
if (kb > BUDGET_GZIP_KB) {
  console.error('Bundle budget exceeded.');
  process.exit(1);
}
