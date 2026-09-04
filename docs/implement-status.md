# Implementation Status

Tracks the build of **calm-adhd-skills** against [PRD.md](./PRD.md).

- **Last updated:** 2026-09-04
- **Version:** 0.1.0 (not published)
- **Overall:** scaffold complete and locally tested. Not yet released.

Legend: ✅ done · 🟡 partly done · ⬜ not started

---

## 1. Summary

| Area | Status |
| --- | --- |
| Docs (PRD) | ✅ Done |
| Directory layout (PRD §3) | ✅ Done |
| Skills / prompts (PRD §4) | ✅ Done |
| CLI installer (PRD §5) | ✅ Done |
| Local CLI testing | ✅ Done |
| Editor testing (PRD §6) | ⬜ Not started |
| Repo + license | 🟡 Partly done (git init ✅, license ⬜) |
| npm publish | ⬜ Not started |

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
- ✅ `git init` on branch `main` + initial commit (`919a168`, 13 files).
  `.claude/settings.local.json` and the headroom state files are ignored as
  per-machine state.

### 2.3 Skills (PRD §4)

All seven written verbatim from the PRD, each with `name` + `description`
frontmatter:

| # | Skill | File | Status |
| --- | --- | --- | --- |
| 4.1 | `/analyze` | `skills/analyze/SKILL.md` | ✅ |
| 4.2 | `/implement` | `skills/implement/SKILL.md` | ✅ |
| 4.3 | `/verify` | `skills/verify/SKILL.md` | ✅ |
| 4.4 | `/defend-code` | `skills/defend-code/SKILL.md` | ✅ |
| 4.5 | `/audit-infra` | `skills/audit-infra/SKILL.md` | ✅ |
| 4.6 | `/harden-network` | `skills/harden-network/SKILL.md` | ✅ |
| 4.7 | `/audit-logs` | `skills/audit-logs/SKILL.md` | ✅ |

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

Run in a throwaway directory, since the CLI writes to the working directory:

| Check | Result |
| --- | --- |
| `--help` output | ✅ Pass |
| Default install | ✅ 7 files under `.agents/skills/` |
| `--continue` | ✅ 7 prompts, no filename collision |
| `--antigravity` onto a file with existing user rules | ✅ Appended, rules kept |
| Re-run `--antigravity` | ✅ Still 140 lines, 1 marker, no duplication |
| `--global` (with `HOME` redirected to a sandbox) | ✅ Correct target path |
| Unknown flag | ✅ Error, non-zero exit |

---

## 3. Pending

### 3.1 Blocked on your decision

| # | Task | Why it is blocked |
| --- | --- | --- |
| P1 | Add a `LICENSE` file | `package.json` says MIT, but a LICENSE needs a real copyright holder. Tell me the name/org to use. |
| P2 | Fill in `package.json` author + `repository` | Needs your name/handle and the Git remote URL. |
| P3 | Confirm the npm name | `calm-adhd-skills` is unverified on the registry. If taken, fall back to `@your-scope/calm-adhd-skills`. |

### 3.2 Ready to do

| # | Task | Notes |
| --- | --- | --- |
| P5 | Push to a remote | Needs the remote URL from P2. |
| P6 | Smoke-test script | Wrap the §2.5 checks as `npm test` so they are repeatable. Right now `npm test` only runs `--help`. |
| P7 | CI workflow | Run the smoke test on push, on Node 18/20/22. |

### 3.3 Real-editor testing (PRD §6) — none done yet

Section 2.5 only proves the CLI writes correct files. It does **not** prove any
editor picks them up.

| # | Task | Acceptance |
| --- | --- | --- |
| P8 | Test in Zed | `/` in the Agent panel lists all 7 commands; `/analyze src/auth.ts and I want to add rate limiting` returns a plan and edits nothing. |
| P9 | Test in VS Code (Continue) | `/analyze` autocompletes in the chat panel after `--continue`. |
| P10 | Test in Antigravity | `/defend-code check our database connection file` returns a safe diff, no exploit payload. |
| P11 | Confirm the `.agents/skills/` convention | The PRD assumes Zed reads this path. Verify against current Zed docs before publishing. |

### 3.4 Release

| # | Task | Depends on |
| --- | --- | --- |
| P12 | `npm pack` and inspect the tarball | P1–P3 |
| P13 | `npm publish` | P12, P8–P10 |
| P14 | Verify `npx calm-adhd-skills` from a clean machine | P13 |

---

## 4. Known risks

- **P11 is the big one.** Every install path in the PRD (`.agents/skills/`,
  `.continue/prompts/`, `.antigravity/rules.md`) is taken from the PRD, not from
  first-party editor docs. If a path is wrong, the install silently does nothing
  useful. Confirm before publishing.
- **No automated tests.** The §2.5 checks were run by hand and are not yet
  repeatable in CI (P6).
- **PRD §5 drift.** The PRD keeps the minimal code sketch, with a note that the
  shipped CLI is fuller. If the CLI changes further, update that note.
