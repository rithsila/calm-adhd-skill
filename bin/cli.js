#!/usr/bin/env node
'use strict';

/**
 * Installer for calm-adhd-skills.
 *
 * Install paths, verified against the editors' own docs (2026-09):
 *
 *   Zed project      <cwd>/.agents/skills/<name>/SKILL.md
 *   Zed global       ~/.agents/skills/<name>/SKILL.md
 *   Antigravity      <cwd>/.agents/skills/<name>/SKILL.md   (same path as Zed)
 *   Antigravity glo. ~/.gemini/config/skills/<name>/SKILL.md
 *   Continue         <cwd>/.continue/prompts/<name>.md      (needs invokable: true)
 *   Continue global  ~/.continue/prompts/<name>.md
 */

const fs = require('fs');
const path = require('path');

const pkg = require('../package.json');

const SKILLS_SOURCE = path.join(__dirname, '..', 'skills');
const HOME = process.env.HOME || process.env.USERPROFILE;

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
  --project        Install to ./.agents/skills/ (default).
                   Zed and Antigravity both read this path.
  --global         Install for every project instead of just this one.
  --antigravity    Install where Antigravity looks. Same as --project,
                   unless combined with --global.
  --continue       Install prompts to ./.continue/prompts/.
  -h, --help       Show this help
  -v, --version    Show the version

Examples:
  npx ${pkg.name}                      # this project (Zed + Antigravity)
  npx ${pkg.name} --global             # every project, in Zed
  npx ${pkg.name} --global --antigravity   # every project, in Antigravity
  npx ${pkg.name} --continue           # VS Code, via the Continue extension

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

/** Copy the whole skills/ tree. Used by Zed and Antigravity alike. */
function installSkills(targetBase, label) {
  fs.mkdirSync(path.dirname(targetBase), { recursive: true });
  fs.cpSync(SKILLS_SOURCE, targetBase, { recursive: true });
  console.log(green(`✔ ${label}: ${targetBase}`));
}

/**
 * Continue only lists a markdown prompt as a slash command when its
 * frontmatter sets `invokable: true`, so rebuild the frontmatter on the way
 * out instead of copying SKILL.md as-is.
 */
function toContinuePrompt(skill) {
  return [
    '---',
    `name: ${skill.name}`,
    `description: ${skill.description}`,
    'invokable: true',
    '---',
    '',
    skill.body,
    '',
  ].join('\n');
}

/** Write one prompt file per skill, named after the skill. */
function installContinuePrompts(skills, targetDir) {
  fs.mkdirSync(targetDir, { recursive: true });
  for (const skill of skills) {
    fs.writeFileSync(path.join(targetDir, `${skill.name}.md`), toContinuePrompt(skill));
  }
  console.log(green(`✔ Continue prompts: ${targetDir}`));
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
  // --project is the default when no other target is named.
  const wantsProject = args.includes('--project') || (!wantsAntigravity && !wantsContinue);

  if (isGlobal && !HOME) fail('Cannot resolve your home directory for --global.');

  const cwd = process.cwd();
  const skills = readSkills();

  if (wantsProject) {
    const target = isGlobal
      ? path.join(HOME, '.agents', 'skills')
      : path.join(cwd, '.agents', 'skills');
    installSkills(target, isGlobal ? 'Skills installed for every project' : 'Skills installed');
  }

  if (wantsAntigravity) {
    // Antigravity reads .agents/skills in the workspace, the same path Zed
    // uses, but keeps its global skills under ~/.gemini/config/skills.
    const target = isGlobal
      ? path.join(HOME, '.gemini', 'config', 'skills')
      : path.join(cwd, '.agents', 'skills');
    installSkills(target, 'Antigravity skills');
  }

  if (wantsContinue) {
    const root = isGlobal ? HOME : cwd;
    installContinuePrompts(skills, path.join(root, '.continue', 'prompts'));
  }

  console.log('');
  console.log('Available slash commands:');
  console.log(`  ${skills.map((skill) => `/${skill.name}`).join(', ')}`);
  console.log(dim('Restart your editor if the commands do not show up yet.'));
}

main();
