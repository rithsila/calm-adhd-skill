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

test('--continue writes one prompt per skill with no collision', (dir) => {
  const { status } = runCli(['--continue'], { cwd: dir });
  assert.strictEqual(status, 0);
  const prompts = fs.readdirSync(path.join(dir, '.continue', 'prompts')).sort();
  assert.deepStrictEqual(prompts, SKILL_NAMES.map((name) => `${name}.md`));
});

test('--antigravity appends and keeps the user rules', (dir) => {
  const rules = path.join(dir, '.antigravity', 'rules.md');
  fs.mkdirSync(path.dirname(rules), { recursive: true });
  fs.writeFileSync(rules, '# My own rules\n\nAlways use tabs.\n');

  const { status } = runCli(['--antigravity'], { cwd: dir });
  assert.strictEqual(status, 0);

  const content = fs.readFileSync(rules, 'utf8');
  assert.ok(content.includes('Always use tabs.'), 'user rules were lost');
  assert.ok(content.includes('calm-adhd-skills:start'), 'missing start marker');
  assert.ok(content.includes('calm-adhd-skills:end'), 'missing end marker');
  for (const name of SKILL_NAMES) {
    assert.ok(content.includes(`## /${name}`), `rules are missing /${name}`);
  }
  assert.ok(!content.includes('---\nname:'), 'frontmatter was not stripped');
});

test('--antigravity is idempotent across re-runs', (dir) => {
  const rules = path.join(dir, '.antigravity', 'rules.md');

  runCli(['--antigravity'], { cwd: dir });
  const first = fs.readFileSync(rules, 'utf8');

  runCli(['--antigravity'], { cwd: dir });
  const second = fs.readFileSync(rules, 'utf8');

  assert.strictEqual(second, first, 're-run changed the file');
  const markers = second.match(/calm-adhd-skills:start/g) || [];
  assert.strictEqual(markers.length, 1, `expected 1 marker, got ${markers.length}`);
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

test('an unknown flag fails with a non-zero exit', (dir) => {
  const { status, stderr } = runCli(['--nope'], { cwd: dir });
  assert.notStrictEqual(status, 0, 'expected a non-zero exit');
  assert.ok(stderr.includes('--nope'), 'error should name the bad flag');
  assert.ok(!fs.existsSync(path.join(dir, '.agents')), 'wrote files despite failing');
});

console.log(`\n${passed} passed, ${failed} failed\n`);
process.exit(failed === 0 ? 0 : 1);
