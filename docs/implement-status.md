# Implementation Status

Tracks the build of **calm-adhd-skills** against [PRD.md](./PRD.md).

- **Last updated:** 2026-09-04
- **Version:** 0.1.0 (not published to npm)
- **Remote:** https://github.com/rithsila/calm-adhd-skill (public, pushed)
- **Overall:** scaffold complete and locally tested. Not yet released.

Legend: ✅ done · 🟡 partly done · ⬜ not started

---

## 1. Summary

| Area | Status |
| --- | --- |
| Docs (PRD) | ✅ Done |
| Directory layout (PRD §3) | ✅ Done |
| Skills / prompts (PRD §4) | ✅ Done (8 skills, 11 output rules + handoff) |
| CLI installer (PRD §5) | ✅ Done |
| Local CLI testing | ✅ Done (10 automated smoke tests) |
| Install paths verified (P11) | ✅ Done |
| Editor testing (PRD §6) | ⬜ Not started |
| Repo + license | ✅ Done (MIT, © 2026 rithsila, pushed) |
| CI | 🟡 Written and pushed, blocked by a GitHub billing lock |
| npm publish | ⬜ Not started |
| Broader host support | ⬜ Out of scope (see PRD §7.1) |

---

## 2. Completed

### 2.1 Documentation

- ✅ Fixed the broken Markdown in the copied PRD (unclosed code fences, lost
  heading levels, bare `Markdown` / `Bash` language labels, `-&gt;` entities).
- ✅ Renamed `docs/RRD.md` → `docs/PRD.md`.
- ✅ Renamed the product from `blue-skills` to `calm-adhd-skills` throughout the
  PRD. The Blue Team wording inside the skill prompts is intentionally kept —
  that is the subject matter, not the product name.
- ✅ Corrected PRD §6.2: `cp skills/*/*.md` collapsed all seven files into one
  because each is named `SKILL.md`. Now documents `--continue` instead.
- ✅ Wrote `README.md` (install, command table, editor setup, layout).

### 2.2 Repository scaffold (PRD §3)

- ✅ `bin/cli.js`, executable bit set.
- ✅ `package.json` — name `calm-adhd-skills`, bin `calm-adhd-skills`,
  `files` allowlist, `engines.node >= 16.7.0`, zero runtime dependencies.
- ✅ `.gitignore` — ignores `node_modules/` and the CLI's own local output
  (`.agents/`, `.continue/`, `.antigravity/`).
- ✅ `docs/PRD.md`, `docs/implement-status.md`.
- ✅ `LICENSE` — MIT, © 2026 rithsila. Came from the remote's initial commit;
  local history was rebased on top of it, so the licence is the root commit.
- ✅ `package.json` metadata: `author`, `homepage`, `repository`, `bugs`.
- ✅ Pushed to https://github.com/rithsila/calm-adhd-skill (public).
- ✅ `git init` on branch `main` + initial commit.
  `.claude/settings.local.json` and the headroom state files are ignored as
  per-machine state.

### 2.3 Skills (PRD §4)

Seven written verbatim from the PRD, plus `/status` added on 2026-09-04. Each
has `name` + `description` frontmatter:

| # | Skill | File | Status |
| --- | --- | --- | --- |
| 4.1 | `/analyze` | `skills/analyze/SKILL.md` | ✅ |
| 4.2 | `/implement` | `skills/implement/SKILL.md` | ✅ |
| 4.3 | `/verify` | `skills/verify/SKILL.md` | ✅ |
| 4.4 | `/defend-code` | `skills/defend-code/SKILL.md` | ✅ |
| 4.5 | `/audit-infra` | `skills/audit-infra/SKILL.md` | ✅ |
| 4.6 | `/harden-network` | `skills/harden-network/SKILL.md` | ✅ |
| 4.7 | `/audit-logs` | `skills/audit-logs/SKILL.md` | ✅ |
| 4.8 | `/status` | `skills/status/SKILL.md` | ✅ |

### 2.4 CLI (PRD §2 + §5)

The shipped `bin/cli.js` goes past the PRD §5 sketch, which only handled
`--global`.

| Flag | Behavior | Status |
| --- | --- | --- |
| `--project` | Copies `skills/` → `./.agents/skills/`. Default when no editor target is given. | ✅ |
| `--global` | Retargets the install root to `$HOME`. | ✅ |
| `--continue` | Writes one prompt per skill to `./.continue/prompts/<name>.md`. | ✅ |
| `--antigravity` | Writes a marked block into `./.antigravity/rules.md`. | ✅ |
| `-h`, `--help` | Usage text. | ✅ |
| `-v`, `--version` | Prints the version. | ✅ |
| unknown flag | Prints an error and exits non-zero. | ✅ |

Extra behavior beyond the PRD:

- ✅ Flags combine. `--global` only changes *where*, so name every target you
  want (e.g. `--global --project --continue`).
- ✅ `--antigravity` is re-runnable. Its block sits between
  `<!-- calm-adhd-skills:start -->` and `<!-- calm-adhd-skills:end -->`; a second
  run replaces that block and leaves the user's own rules untouched.
- ✅ Frontmatter is stripped for Antigravity and rendered as `## /<name>`
  headings, since `rules.md` is plain instructions.

### 2.5 Local verification

- ✅ `test/smoke.js` — 10 tests, no dependencies (`node:assert` +
  `node:child_process`). Each case runs in its own temp directory and cleans up,
  so the suite never writes into the repo.
- ✅ Wired to `npm test`.
- ✅ Mutation-checked: breaking the Antigravity end marker and disabling the
  unknown-flag guard each turned the suite red, so the assertions are real.

| Test | Covers |
| --- | --- |
| `--help` exits 0 and lists every command | Usage text |
| `--version` prints the package version | Stays in sync with `package.json` |
| Default install writes all skills | PRD §2 default |
| `--project` matches the default | PRD §2 |
| `--continue` writes one prompt per skill | The `SKILL.md` collision fix |
| `--antigravity` appends, keeps user rules | Non-destructive append |
| `--antigravity` is idempotent | Marker block replace-in-place |
| `--global` targets `$HOME` | Path resolution, no stray cwd writes |
| `--global --project --continue` | Flags combine |
| Unknown flag exits non-zero | Fails without writing files |

### 2.6 Output rules: one source, installed always-on

All 7 `SKILL.md` files end with the same block, byte-identical, enforced by a
test so they cannot drift:

1. Lead with the next action. Put it on line 1.
2. Number multi-step work.
3. Cap every list at 5 items.
4. Use simple English. The reader is not a native speaker.
5. Give time estimates in minutes. Never say "a bit" or "a while".
6. Restate the current state every turn. Do not assume memory.
7. Make wins visible. Name what works now.
8. Report errors matter-of-factly. No drama, no apology.
9. Cut tangents, history, and theory.
10. No preamble. No recap. No closers.
11. End with one concrete next step.

Plus a **session handoff** rule: update `implement-status.md`, then print a
copy-paste prompt for the next session. Rules 1-3 and 5-10 come from the
`i-have-adhd` rule set; rule 4 and the handoff rule are the user's own.

- ✅ `rules.md` at the repo root is the only place to edit them.
- ✅ `npm run sync-rules` copies the block into all 7 skills.
  `npm test` runs `--check` first and fails on drift.
- ✅ The installer also writes them as an always-on rules file, so they apply to
  every reply, not only to slash commands: `AGENTS.md` (or an existing `.rules`)
  for Zed, `.agents/rules/calm-adhd.md` for Antigravity, and
  `.continue/rules/calm-adhd.md` with `alwaysApply: true` for Continue.
- ✅ `--no-rules` skips the rules files.
- ✅ 18 smoke tests now, up from 11.
- ✅ Caught a real drift: all 8 `SKILL.md` files were edited outside the repo
  (rule 4 became "native read  speaker"). `pretest` failed, and
  `npm run sync-rules` restored them from `rules.md`.

### 2.7 CI (P7)

- ✅ `.github/workflows/ci.yml` — runs `npm test` on push to `main`, on every
  pull request, and on manual dispatch.
- ✅ Matrix: Node 18/20/22/24 on Ubuntu, plus Node 22 on macOS and Windows
  (the installer joins paths and falls back to `USERPROFILE`, so Windows is
  worth covering).
- ✅ A `pack` job runs `npm pack --dry-run` and fails if any of the 7 skills is
  missing from the tarball.
- ⬜ Never actually executed — there is no remote yet (P5).

### 2.8 Install paths verified (P11)

Checked against the editors' own documentation on 2026-09-04. This closed the
biggest pre-publish risk, and found two wrong paths in the original PRD.

| Target | PRD said | Docs say | Verdict |
| --- | --- | --- | --- |
| Zed, project | `./.agents/skills/` | `<worktree>/.agents/skills/` | ✅ Correct |
| Zed, global | `~/.agents/skills/` | `~/.agents/skills` | ✅ Correct |
| Antigravity, workspace | `./.antigravity/rules.md` | `.agents/skills/` | ❌ Fixed |
| Antigravity, global | — | `~/.gemini/config/skills/` | ❌ Added |
| Continue | `.continue/prompts/*.md` | needs `invokable: true` | ❌ Fixed |

What changed in the code:

- ✅ `--antigravity` no longer writes `.antigravity/rules.md`, a path that does
  not exist. Antigravity reads `.agents/skills/` in the workspace — the same
  path as Zed — so the flag now installs skills there, and to
  `~/.gemini/config/skills/` when combined with `--global`.
- ✅ The marker-block logic for `rules.md` was deleted along with it.
- ✅ `--continue` now writes `invokable: true` into the frontmatter. Without it
  Continue does not list the prompt as a slash command, so the old plain copy
  installed seven files that would never have appeared.
- ✅ Zed's own constraints check out: `name` matches each folder name, all names
  fit `^[a-z0-9]+(-[a-z0-9]+)*$`, every description is well under 1024 bytes,
  and each skill is a direct child of the skills root (no nesting).

One behavior difference worth knowing: Antigravity selects skills by
description, not by slash command, so `/defend-code` is a Zed and Continue
gesture. In Antigravity you describe the task instead.

---

## 3. Pending

### 3.1 Blocked on your account

| # | Task | Why it is blocked |
| --- | --- | --- |
| P16 | Unlock GitHub Actions | Every CI job failed with "your account is locked due to a billing issue". No job ever started, so the workflow is still unproven. The repo is public, so Actions minutes are free — this is an account-level lock, not a repo cost. Fix it in GitHub billing settings, then re-run. |

### 3.2 Ready to do

| # | Task | Notes |
| --- | --- | --- |

### 3.3 Real-editor testing (PRD §6) — none done yet

Section 2.5 only proves the CLI writes correct files. It does **not** prove any
editor picks them up.

| # | Task | Acceptance |
| --- | --- | --- |
| P8 | Test in Zed | `/` in the Agent panel lists all 7 commands; `/analyze src/auth.ts and I want to add rate limiting` returns a plan and edits nothing. |
| P9 | Test in VS Code (Continue) | `/analyze` autocompletes in the chat panel after `--continue`. |
| P10 | Test in Antigravity | `/defend-code check our database connection file` returns a safe diff, no exploit payload. |

### 3.4 Release

| # | Task | Depends on |
| --- | --- | --- |
| P12 | `npm pack` and inspect the tarball | P1–P3 |
| P13 | `npm publish` | P12, P8–P10 |
| P14 | Verify `npx calm-adhd-skills` from a clean machine | P13 |

### 3.5 Deferred

| # | Task | Notes |
| --- | --- | --- |
| P15 | Plugin manifests for other hosts | Claude Code, Cursor, opencode, Gemini / Qwen / Kimi. Out of scope until npx ships — PRD §7.1. |

---

## 4. Known risks

- ~~**P11 install paths.**~~ Resolved — see §2.7. Two of the four were wrong and
  are now fixed. The remaining exposure is that the paths were confirmed from
  documentation, not by running the editors (P8–P10).
- **CI is unproven.** The workflow is pushed, but all 7 jobs were refused before
  starting: "your account is locked due to a billing issue". The YAML has never
  executed, so it may still contain errors. Blocked on P16, not on code.
- **PRD §5 drift.** The PRD keeps the minimal code sketch, with a note that the
  shipped CLI is fuller. If the CLI changes further, update that note.

---

## 5. Decisions log

| Date | Decision | Reason |
| --- | --- | --- |
| 2026-09-04 | Product renamed `blue-skills` → `calm-adhd-skills` | Your call. Blue Team wording inside the prompts is kept, since that is the subject matter. |
| 2026-09-04 | `--continue` writes `<name>.md`, not `SKILL.md` | The PRD's `cp skills/*/*.md` collapsed all 7 files into one. |
| 2026-09-04 | `--antigravity` uses a marker block | Makes re-runs safe and leaves the user's own rules alone. |
| 2026-09-04 | `.claude/settings.local.json` + headroom files gitignored | Per-machine state. The rest of `.claude/` stays trackable. |
| 2026-09-04 | `/status` added as an 8th skill, self-contained | It generates `implement-status.md` from the PRD and the repo. It needs no companion doc — `Architecture.md`, `intent.md`, `CLAUDE.md` are not required, and depending on them would make it fail in most repos. The output template lives inside the skill so it also works in Continue, which installs a single flat file. |
| 2026-09-04 | Rules moved into `rules.md`, synced into skills | Seven hand-copied blocks drift. One source plus a `--check` in `pretest` makes drift a failing test, not a review problem. |
| 2026-09-04 | Rules also installed as an always-on editor rules file | The rules only applied when a slash command ran. Users install the package to get the behavior everywhere. |
| 2026-09-04 | Owned rules files written whole; shared files use markers | Continue needs YAML frontmatter on line 1, so a marker comment above it breaks parsing. `AGENTS.md` and `.rules` belong to the user, so those keep markers. |
| 2026-09-04 | Rebased local history onto the remote's LICENSE commit | Keeps one linear history with the licence at the root, instead of a merge of unrelated histories. |
| 2026-09-04 | npm package `calm-adhd-skills`, GitHub repo `calm-adhd-skill` | The names differ by one "s". Registry returns 404 for the package name, so it is free. Left as-is; rename the repo if you want them to match. |
| 2026-09-04 | Output block expanded to 11 rules + session handoff | The 6-bullet version was too soft. Adopted the `i-have-adhd` rule set, plus the user's own two: simple English for non-native readers, and a session handoff that saves tokens on resume. |
| 2026-09-04 | Independent repo, not a fork of `ayghri/i-have-adhd` | Upstream is a different project (output shaping, 1 skill, no npx CLI). Forking would inherit 192 unrelated commits, a logo, 7 translations, and an eval harness. Credited as prior art in the README instead. |
| 2026-09-04 | Shared output-style block added to all 7 skills | The name is calm-adhd, but the skills only said "simple English". The block makes the constraint concrete, and a test keeps all 7 byte-identical. |
| 2026-09-04 | Broader host support deferred | Publish and prove the npx path first. Tracked in PRD §7.1. |
| 2026-09-04 | `--antigravity` repurposed from `.antigravity/rules.md` to `.agents/skills/` | The documented path does not exist. Antigravity reads `.agents/skills/`. Nothing was published under the old behavior. |
| 2026-09-04 | `--continue` injects `invokable: true` | Continue does not surface a prompt as a slash command without it. |
| 2026-09-04 | `engines.node` raised `>=16.7.0` → `>=18.0.0` | `fs.cpSync` needs 16.7, but Node 16 went EOL in 2023 and CI does not cover it. Claiming only what is tested. Revert if you need 16.x. |
