// scripts/check-overflow.mjs
//
// Headless-browser check for horizontal overflow on every HTML page.
// This catches the class of layout bug that pure-static-file audits miss:
// content that exceeds its container width and either wraps in unintended
// ways or pushes the page into horizontal scrolling.
//
// The Wave 14OW navbar bug (logo crashing into nav links, multi-word
// anchors wrapping mid-text) was exactly this class. A single boolean
// assertion at 4 viewports would have caught it on the first audit pass.
//
// Usage:
//   npm install
//   npx playwright install chromium  (one-time, ~140MB)
//   npm run check:overflow
//
// Exit code 0 = all pages pass at all viewports; non-zero = N failures.

import { chromium } from 'playwright';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { readdirSync, statSync } from 'node:fs';
import { join, dirname } from 'node:path';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const VIEWPORTS = [1024, 1280, 1440, 1920];
const HEIGHT = 900;

// Sub-pixel font rendering can produce 1px overflow that isn't user-visible.
// Tolerance of 1px filters those without hiding real bugs.
const TOLERANCE_PX = 1;

// Folders we never scan — node_modules has its own HTML files in deps,
// .git is metadata, scripts is our tooling.
const SKIP_DIRS = new Set(['node_modules', '.git', 'scripts']);

function findHtmlFiles(dir, results = []) {
    for (const name of readdirSync(dir)) {
        if (name.startsWith('.') || SKIP_DIRS.has(name)) continue;
        const full = join(dir, name);
        const st = statSync(full);
        if (st.isDirectory()) findHtmlFiles(full, results);
        else if (name.endsWith('.html')) results.push(full);
    }
    return results;
}

const files = findHtmlFiles(ROOT).sort();
const totalChecks = files.length * VIEWPORTS.length;

console.log(`check-overflow: ${files.length} HTML files × ${VIEWPORTS.length} viewports = ${totalChecks} checks`);
console.log(`viewports: ${VIEWPORTS.join(', ')}px (height: ${HEIGHT}px, tolerance: ${TOLERANCE_PX}px)\n`);

const browser = await chromium.launch();
const failures = [];

for (const file of files) {
    const relPath = file.substring(ROOT.length + 1).replace(/\\/g, '/');
    const fileResults = [];
    for (const width of VIEWPORTS) {
        const ctx = await browser.newContext({ viewport: { width, height: HEIGHT } });
        const page = await ctx.newPage();
        try {
            await page.goto(pathToFileURL(file).href, { waitUntil: 'load', timeout: 10000 });
            const metrics = await page.evaluate(() => ({
                scrollWidth: document.documentElement.scrollWidth,
                clientWidth: document.documentElement.clientWidth,
            }));
            const delta = metrics.scrollWidth - metrics.clientWidth;
            if (delta > TOLERANCE_PX) {
                fileResults.push({ width, status: 'FAIL', delta, ...metrics });
                failures.push({ file: relPath, width, delta, ...metrics });
            } else {
                fileResults.push({ width, status: 'pass' });
            }
        } catch (e) {
            fileResults.push({ width, status: 'ERROR', error: e.message });
            failures.push({ file: relPath, width, error: e.message });
        } finally {
            await ctx.close();
        }
    }
    const summary = fileResults.map(r => {
        if (r.status === 'pass') return `${r.width}✓`;
        if (r.status === 'FAIL') return `${r.width}✗(+${r.delta}px)`;
        return `${r.width}!`;
    }).join('  ');
    console.log(`  ${summary}   ${relPath}`);
}

await browser.close();

console.log(`\n${'─'.repeat(72)}`);
if (failures.length === 0) {
    console.log(`✓ All ${totalChecks} checks passed.`);
    process.exit(0);
} else {
    console.log(`✗ ${failures.length} failure(s):\n`);
    for (const f of failures) {
        if (f.error) {
            console.log(`  ${f.file} @ ${f.width}px:  ${f.error}`);
        } else {
            console.log(`  ${f.file} @ ${f.width}px:  scrollWidth=${f.scrollWidth}, clientWidth=${f.clientWidth}, overflow=+${f.delta}px`);
        }
    }
    process.exit(1);
}
