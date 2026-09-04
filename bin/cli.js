#!/usr/bin/env node
'use strict';

const fs = require('fs');
const path = require('path');

const pkg = require('../package.json');

const SKILLS_SOURCE = path.join(__dirname, '..', 'skills');
const HOME = process.env.HOME || process.env.USERPROFILE;

// Markers let us re-run --antigravity without duplicating the rules.
const MARKER_START = '<!-- calm-adhd-skills:start -->';
const MARKER_END = '<!-- calm-adhd-skills:end -->';

const green = (s) => `\x1b[32m${s}\x1b[0m`;
const red = (s) => `\x1b[31m${s}\x1b[0m`;
const dim = (s) => `\x1b[2m${s}\x1b[0m`;

function fail(message) {
  console.error(red(`✖ ${message}`));
  process.exit(1);
}

function printHelp() {
  console.log(`
${pkg.name} v${pkg.version}
${pkg.description}

Usage:
  npx ${pkg.name} [options]

Options:
  --project        Install skills into ./.agents/skills/ (default)
  --global         Install skills into ~/.agents/skills/
  --antigravity    Append skill rules to ./.antigravity/rules.md
  --continue       Install prompts into ./.continue/prompts/
  -h, --help       Show this help
  -v, --version    Show the version

Slash commands installed:
  /analyze, /implement, /verify, /defend-code, /audit-infra,
  /harden-network, /audit-logs
`);
}

/**
 * Read every skills/<name>/SKILL.md and split off its YAML frontmatter.
 * Returns: [{ name, description, body, source }]
 */
function readSkills() {
  if (!fs.existsSync(SKILLS_SOURCE)) {
    fail(`Skills source directory not found: ${SKILLS_SOURCE}`);
  }

  const skills = fs
    .readdirSync(SKILLS_SOURCE, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => {
      const source = path.join(SKILLS_SOURCE, entry.name, 'SKILL.md');
      if (!fs.existsSync(source)) return null;

      const raw = fs.readFileSync(source, 'utf8');
      const match = raw.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?([\s\S]*)$/);
      const front = match ? match[1] : '';
      const body = match ? match[2].trim() : raw.trim();

      const nameLine = front.match(/^name:\s*(.+)$/m);
      const descLine = front.match(/^description:\s*(.+)$/m);

      return {
        name: nameLine ? nameLine[1].trim() : entry.name,
        description: descLine ? descLine[1].trim() : '',
        body,
        source,
      };
    })
    .filter(Boolean);

  if (skills.length === 0) fail('No skills found to install.');
  return skills;
}

/** Copy the whole skills/ tree to .agents/skills/. */
function installSkills(targetBase) {
  fs.mkdirSync(path.dirname(targetBase), { recursive: true });
  fs.cpSync(SKILLS_SOURCE, targetBase, { recursive: true });
  console.log(green(`✔ Skills installed to: ${targetBase}`));
}

/** Write one flat prompt file per skill, named after the skill. */
function installContinuePrompts(skills, targetDir) {
  fs.mkdirSync(targetDir, { recursive: true });
  for (const skill of skills) {
    fs.copyFileSync(skill.source, path.join(targetDir, `${skill.name}.md`));
  }
  console.log(green(`✔ Continue prompts installed to: ${targetDir}`));
}

/** Append (or replace) our marked block inside .antigravity/rules.md. */
function installAntigravityRules(skills, rulesFile) {
  const block = [
    MARKER_START,
    '',
    '# Calm-ADHD Skills',
    '',
    'Treat each heading below as a slash command. When the user types the',
    'command, follow the rules under it.',
    '',
    ...skills.map((skill) =>
      [`## /${skill.name}`, '', `${skill.description}`, '', skill.body, ''].join('\n')
    ),
    MARKER_END,
    '',
  ].join('\n');

  fs.mkdirSync(path.dirname(rulesFile), { recursive: true });

  let existing = fs.existsSync(rulesFile) ? fs.readFileSync(rulesFile, 'utf8') : '';
  const start = existing.indexOf(MARKER_START);
  const end = existing.indexOf(MARKER_END);

  if (start !== -1 && end !== -1 && end > start) {
    // Replace the block we wrote last time, leave the user's own rules alone.
    const before = existing.slice(0, start);
    const after = existing.slice(end + MARKER_END.length).replace(/^\r?\n/, '');
    existing = before + block + after;
    fs.writeFileSync(rulesFile, existing);
    console.log(green(`✔ Antigravity rules updated in: ${rulesFile}`));
    return;
  }

  const separator = existing.length > 0 && !existing.endsWith('\n\n') ? '\n\n' : '';
  fs.writeFileSync(rulesFile, existing + separator + block);
  console.log(green(`✔ Antigravity rules appended to: ${rulesFile}`));
}

function main() {
  const args = process.argv.slice(2);

  if (args.includes('-h') || args.includes('--help')) return printHelp();
  if (args.includes('-v') || args.includes('--version')) return console.log(pkg.version);

  const known = ['--project', '--global', '--antigravity', '--continue'];
  const unknown = args.filter((arg) => !known.includes(arg));
  if (unknown.length > 0) {
    fail(`Unknown option: ${unknown.join(', ')}. Run with --help to see the options.`);
  }

  const isGlobal = args.includes('--global');
  const wantsAntigravity = args.includes('--antigravity');
  const wantsContinue = args.includes('--continue');
  // --project is the default when no editor target is given.
  const wantsSkills = args.includes('--project') || (!wantsAntigravity && !wantsContinue);

  if (isGlobal && !HOME) fail('Cannot resolve your home directory for --global.');

  const root = isGlobal ? HOME : process.cwd();
  const skills = readSkills();

  if (wantsSkills) installSkills(path.join(root, '.agents', 'skills'));
  if (wantsContinue) installContinuePrompts(skills, path.join(root, '.continue', 'prompts'));
  if (wantsAntigravity) installAntigravityRules(skills, path.join(root, '.antigravity', 'rules.md'));

  console.log('');
  console.log('Available slash commands:');
  console.log(`  ${skills.map((skill) => `/${skill.name}`).join(', ')}`);
  console.log(dim('Restart your editor if the commands do not show up yet.'));
}

main();
