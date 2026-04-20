#!/usr/bin/env node
/**
 * Bundle the canonical ES-module source files into a single IIFE
 * so the app works when opened via file:// (double-click).
 *
 * Run from the repo root:  node apps/mii-designer/build.js
 */

const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..', '..');

const sources = [
  'shared/schema/miiSchema.js',
  'shared/schema/exampleMii.js',
  'apps/mii-designer/lib/palette.js',
  'apps/mii-designer/lib/toast.js',
  'apps/mii-designer/lib/miiRenderer.js',
  'apps/mii-designer/lib/storage.js',
  'apps/mii-designer/main.js'
];

let bundle = `/**
 * GENERATED BUNDLE — do not edit directly.
 *
 * Canonical sources (edit these instead):
 * ${sources.map(s => '  ' + s).join('\n *')}
 *
 * This file is an IIFE so it works when opened via file:// (double-click).
 * ES modules are blocked on the file:// protocol by browser CORS policy.
 * Rebuild by running:  node apps/mii-designer/build.js
 */\n\n(function () {\n  'use strict';\n\n`;

for (const s of sources) {
  let content = fs.readFileSync(path.join(ROOT, s), 'utf8');
  content = content.replace(/export (const|let|var|function)/g, '$1');
  content = content.replace(/export (default )?/g, '');
  content = content.replace(/^import[\s\S]*?from .*?;$/gm, '');
  bundle += `/* ================================================================\n   ${s}\n   ================================================================ */\n\n${content}\n\n`;
}

bundle += `})();\n`;
fs.writeFileSync(path.join(ROOT, 'apps/mii-designer/app.js'), bundle);
console.log('✔ Regenerated apps/mii-designer/app.js');
