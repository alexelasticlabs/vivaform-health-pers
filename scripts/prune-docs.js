#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

const repoRoot = path.resolve(__dirname, '..');

function safeRm(p) {
  try {
    fs.rmSync(p, { force: true });
    console.log('Removed', path.basename(p));
  } catch (e) {
    console.error('Failed to remove', p, e.message);
  }
}

const entries = fs.readdirSync(repoRoot, { withFileTypes: true });
for (const ent of entries) {
  if (!ent.isFile()) continue;
  const name = ent.name;
  const full = path.join(repoRoot, name);
  if (name.toLowerCase().endsWith('.md') && name !== 'README.md') {
    safeRm(full);
  }
}
// Remove stray text doc with emoji if present
const emojiFile = path.join(repoRoot, '🥗 VivaForm — приложение для питания и з.txt');
if (fs.existsSync(emojiFile)) safeRm(emojiFile);
