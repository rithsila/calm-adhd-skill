#!/usr/bin/env node
'use strict';

/**
 * Copy the canonical block out of rules.md into every skills/<name>/SKILL.md.
 *
 * rules.md is the only place to edit the rules. Run this after changing it:
 *   npm run sync-rules
 *
 * Pass --check to verify without writing (used by the tests and CI).
 */

const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const RULES_FILE = path.join(ROOT, 'rules.md');
const SKILLS_DIR = path.join(ROOT, 'skills');
// Anchored to a whole line, so the phrase can still appear in prose above.
const ANCHOR = /^Output style:$/gm;

/** Index of the LAST line that is exactly "Output style:", or -1. */
function anchorIndex(text) {
  ANCHOR.lastIndex = 0;
  let index = -1;
  let match;
  while ((match = ANCHOR.exec(text)) !== null) index = match.index;
  return index;
}

/** Everything from "Output style:" to the end of rules.md. */
function readCanonicalBlock() {
  const raw = fs.readFileSync(RULES_FILE, 'utf8');
  const index = anchorIndex(raw);
  if (index === -1) {
    console.error('✖ rules.md has no "Output style:" line.');
    process.exit(1);
  }
  return raw.slice(index).trim();
}

function skillFiles() {
  return fs
    .readdirSync(SKILLS_DIR, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => path.join(SKILLS_DIR, entry.name, 'SKILL.md'))
    .filter((file) => fs.existsSync(file));
}

function main() {
  const check = process.argv.includes('--check');
  const block = readCanonicalBlock();

  const stale = [];
  for (const file of skillFiles()) {
    const content = fs.readFileSync(file, 'utf8');
    const index = anchorIndex(content);
    const head = index === -1 ? content.trimEnd() + '\n\n' : content.slice(0, index);
    const wanted = head + block + '\n';

    if (content === wanted) continue;

    stale.push(path.relative(ROOT, file));
    if (!check) fs.writeFileSync(file, wanted);
  }

  if (check) {
    if (stale.length > 0) {
      console.error('✖ These skills are out of sync with rules.md:');
      for (const file of stale) console.error(`    ${file}`);
      console.error('  Run: npm run sync-rules');
      process.exit(1);
    }
    console.log(`✔ All ${skillFiles().length} skills match rules.md`);
    return;
  }

  if (stale.length === 0) {
    console.log(`✔ Already in sync (${skillFiles().length} skills)`);
    return;
  }
  console.log(`✔ Synced ${stale.length} skill(s) from rules.md:`);
  for (const file of stale) console.log(`    ${file}`);
}

main();
