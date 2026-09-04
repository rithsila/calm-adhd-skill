#!/usr/bin/env node
'use strict';

/**
 * Smoke tests for bin/cli.js.
 *
 * The CLI writes into the current working directory, so every case runs inside
 * a fresh temp directory that is removed afterwards. No dependencies: plain
 * node:assert and node:child_process so this runs anywhere the package does.
 */

const assert = require('assert');
const { spawnSync } = require('child_process');
const fs = require('fs');
const os = require('os');
const path = require('path');

const CLI = path.join(__dirname, '..', 'bin', 'cli.js');
const pkg = require('../package.json');

const SKILL_NAMES = [
  'analyze',
  'audit-infra',
  'audit-logs',
  'defend-code',
  'harden-network',
  'implement',
  'status',
  'verify',
];

let passed = 0;
let failed = 0;

/** Run the CLI in `cwd`. Returns { status, stdout, stderr }. */
function runCli(args, { cwd, env } = {}) {
  const result = spawnSync(process.execPath, [CLI, ...args], {
    cwd: cwd || process.cwd(),
    env: { ...process.env, ...env },
    encoding: 'utf8',
  });
  return {
    status: result.status,
    stdout: result.stdout || '',
    stderr: result.stderr || '',
  };
}

/** Run one case in a throwaway directory, then clean it up. */
function test(name, fn) {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'calm-adhd-skills-'));
  try {
    fn(dir);
    console.log(`  ok  ${name}`);
    passed++;
  } catch (error) {
    console.error(`  FAIL  ${name}`);
    console.error(`        ${error.message.split('\n')[0]}`);
    failed++;
  } finally {
    fs.rmSync(dir, { recursive: true, force: true });
  }
}

console.log(`\nSmoke tests for ${pkg.name} v${pkg.version}\n`);

test('--help exits 0 and lists every command', (dir) => {
  const { status, stdout } = runCli(['--help'], { cwd: dir });
  assert.strictEqual(status, 0, `expected exit 0, got ${status}`);
  for (const name of SKILL_NAMES) {
    assert.ok(stdout.includes(`/${name}`), `help is missing /${name}`);
  }
});

test('--version prints the package version', (dir) => {
  const { status, stdout } = runCli(['--version'], { cwd: dir });
  assert.strictEqual(status, 0);
  assert.strictEqual(stdout.trim(), pkg.version);
});

test('default install writes all skills to .agents/skills', (dir) => {
  const { status } = runCli([], { cwd: dir });
  assert.strictEqual(status, 0);
  for (const name of SKILL_NAMES) {
    const file = path.join(dir, '.agents', 'skills', name, 'SKILL.md');
    assert.ok(fs.existsSync(file), `missing ${name}/SKILL.md`);
    assert.ok(fs.readFileSync(file, 'utf8').includes(`name: ${name}`));
  }
});

test('--project is the same as the default', (dir) => {
  assert.strictEqual(runCli(['--project'], { cwd: dir }).status, 0);
  const installed = fs.readdirSync(path.join(dir, '.agents', 'skills')).sort();
  assert.deepStrictEqual(installed, SKILL_NAMES);
});

test('--continue writes one invokable prompt per skill', (dir) => {
  const { status } = runCli(['--continue'], { cwd: dir });
  assert.strictEqual(status, 0);

  const promptDir = path.join(dir, '.continue', 'prompts');
  const prompts = fs.readdirSync(promptDir).sort();
  assert.deepStrictEqual(prompts, SKILL_NAMES.map((name) => `${name}.md`));

  for (const name of SKILL_NAMES) {
    const content = fs.readFileSync(path.join(promptDir, `${name}.md`), 'utf8');
    // Continue only lists a prompt as a slash command when this is set.
    assert.ok(content.includes('invokable: true'), `${name}.md is not invokable`);
    assert.ok(content.includes(`name: ${name}`), `${name}.md lost its name`);
    assert.ok(content.trim().length > 60, `${name}.md lost its body`);
  }
});

test('--antigravity installs skills where Antigravity reads them', (dir) => {
  const { status } = runCli(['--antigravity'], { cwd: dir });
  assert.strictEqual(status, 0);
  for (const name of SKILL_NAMES) {
    assert.ok(
      fs.existsSync(path.join(dir, '.agents', 'skills', name, 'SKILL.md')),
      `missing ${name} in .agents/skills`
    );
  }
  assert.ok(
    !fs.existsSync(path.join(dir, '.antigravity')),
    'wrote to .antigravity/, a path Antigravity does not read'
  );
});

test('--global --antigravity targets ~/.gemini/config/skills', (dir) => {
  const home = path.join(dir, 'fake-home');
  fs.mkdirSync(home);

  const { status } = runCli(['--global', '--antigravity'], {
    cwd: dir,
    env: { HOME: home, USERPROFILE: home },
  });
  assert.strictEqual(status, 0);
  assert.ok(
    fs.existsSync(path.join(home, '.gemini', 'config', 'skills', 'analyze', 'SKILL.md')),
    'did not install into ~/.gemini/config/skills'
  );
});

test('--global targets the home directory', (dir) => {
  const home = path.join(dir, 'fake-home');
  const workdir = path.join(dir, 'workdir');
  fs.mkdirSync(home);
  fs.mkdirSync(workdir);

  const { status } = runCli(['--global'], {
    cwd: workdir,
    env: { HOME: home, USERPROFILE: home },
  });
  assert.strictEqual(status, 0);
  assert.ok(
    fs.existsSync(path.join(home, '.agents', 'skills', 'analyze', 'SKILL.md')),
    'did not install into HOME'
  );
  assert.ok(
    !fs.existsSync(path.join(workdir, '.agents')),
    '--global also wrote to the working directory'
  );
});

test('flags combine: --global --project --continue', (dir) => {
  const home = path.join(dir, 'fake-home');
  fs.mkdirSync(home);

  const { status } = runCli(['--global', '--project', '--continue'], {
    cwd: dir,
    env: { HOME: home, USERPROFILE: home },
  });
  assert.strictEqual(status, 0);
  assert.ok(fs.existsSync(path.join(home, '.agents', 'skills', 'verify', 'SKILL.md')));
  assert.ok(fs.existsSync(path.join(home, '.continue', 'prompts', 'verify.md')));
});

test('every skill carries the same output-style block', (dir) => {
  const skillsDir = path.join(__dirname, '..', 'skills');
  const blocks = new Set();

  for (const name of SKILL_NAMES) {
    const content = fs.readFileSync(path.join(skillsDir, name, 'SKILL.md'), 'utf8');
    const index = content.indexOf('Output style:');
    assert.notStrictEqual(index, -1, `${name} is missing the output-style block`);
    blocks.add(content.slice(index).trim());
  }

  // One distinct block means all seven are byte-identical.
  assert.strictEqual(blocks.size, 1, `output-style block drifted: ${blocks.size} variants`);

  // And it must survive the install, not just live in the source tree.
  runCli([], { cwd: dir });
  const installed = fs.readFileSync(
    path.join(dir, '.agents', 'skills', 'verify', 'SKILL.md'),
    'utf8'
  );
  assert.ok(installed.includes('Output style:'), 'block lost during install');
  assert.ok(installed.includes('Session handoff:'), 'handoff rule lost during install');
});

test('rules.md is the single source for every skill block', (dir) => {
  const check = spawnSync(process.execPath, [path.join(__dirname, '..', 'scripts', 'sync-rules.js'), '--check'], {
    cwd: path.join(__dirname, '..'),
    encoding: 'utf8',
  });
  assert.strictEqual(check.status, 0, `skills drifted from rules.md:\n${check.stderr}`);
});

test('default install writes Zed rules to AGENTS.md', (dir) => {
  const { status } = runCli([], { cwd: dir });
  assert.strictEqual(status, 0);

  const agents = fs.readFileSync(path.join(dir, 'AGENTS.md'), 'utf8');
  assert.ok(agents.includes('Output style:'), 'AGENTS.md has no rules');
  assert.ok(agents.includes('Session handoff:'), 'AGENTS.md has no handoff rule');
});

test('an existing .rules file is extended, not bypassed', (dir) => {
  // Zed reads the first filename it finds, so AGENTS.md next to .rules is dead.
  const rulesFile = path.join(dir, '.rules');
  fs.writeFileSync(rulesFile, '# my rules\n\nUse tabs.\n');

  runCli([], { cwd: dir });

  const content = fs.readFileSync(rulesFile, 'utf8');
  assert.ok(content.includes('Use tabs.'), 'user rules were lost');
  assert.ok(content.includes('Output style:'), '.rules did not get the block');
  assert.ok(!fs.existsSync(path.join(dir, 'AGENTS.md')), 'wrote AGENTS.md that Zed would ignore');
});

test('installing rules twice does not duplicate them', (dir) => {
  runCli([], { cwd: dir });
  const first = fs.readFileSync(path.join(dir, 'AGENTS.md'), 'utf8');

  runCli([], { cwd: dir });
  const second = fs.readFileSync(path.join(dir, 'AGENTS.md'), 'utf8');

  assert.strictEqual(second, first, 're-run changed AGENTS.md');
  assert.strictEqual((second.match(/calm-adhd-skills:start/g) || []).length, 1);
});

test('Continue rules keep YAML frontmatter on line 1', (dir) => {
  runCli(['--continue'], { cwd: dir });

  const file = path.join(dir, '.continue', 'rules', 'calm-adhd.md');
  const content = fs.readFileSync(file, 'utf8');
  // A marker comment above the frontmatter would stop Continue parsing it.
  assert.ok(content.startsWith('---\n'), `frontmatter is not first: ${content.slice(0, 40)}`);
  assert.ok(content.includes('alwaysApply: true'), 'rule is not always-on');
});

test('--antigravity writes its own rules file', (dir) => {
  runCli(['--antigravity'], { cwd: dir });
  const content = fs.readFileSync(path.join(dir, '.agents', 'rules', 'calm-adhd.md'), 'utf8');
  assert.ok(content.includes('Output style:'), 'Antigravity rules missing');
});

test('--no-rules installs skills only', (dir) => {
  const { status } = runCli(['--no-rules'], { cwd: dir });
  assert.strictEqual(status, 0);
  assert.ok(fs.existsSync(path.join(dir, '.agents', 'skills', 'analyze', 'SKILL.md')));
  assert.ok(!fs.existsSync(path.join(dir, 'AGENTS.md')), '--no-rules still wrote rules');
  assert.ok(!fs.existsSync(path.join(dir, '.agents', 'rules')), '--no-rules still wrote rules');
});

test('an unknown flag fails with a non-zero exit', (dir) => {
  const { status, stderr } = runCli(['--nope'], { cwd: dir });
  assert.notStrictEqual(status, 0, 'expected a non-zero exit');
  assert.ok(stderr.includes('--nope'), 'error should name the bad flag');
  assert.ok(!fs.existsSync(path.join(dir, '.agents')), 'wrote files despite failing');
});

console.log(`\n${passed} passed, ${failed} failed\n`);
process.exit(failed === 0 ? 0 : 1);
