# Product Requirements Document (PRD): Calm-ADHD Skills

## 1. Overview

An open-source skills package distributed via npm/npx. It gives developers and solo operators instant, standardized slash commands inside modern AI coding editors (Zed, Antigravity, VS Code / Continue).

The package focuses on a safe 3-step delivery flow (`/analyze` → `/implement` → `/verify`) and Blue Team defense workflows (`/defend-code`, `/audit-infra`, `/audit-logs`, `/harden-network`).

### Core Output Constraint

- **Language Level:** Simple, plain English only.
- **Audience:** Non-native English speakers.
- **Format:** Short sentences, scannable bullet points, concrete code patches, and zero unnecessary fluff or academic jargon.

Every `SKILL.md` ends with the same 11 output rules plus a session-handoff rule,
byte-identical across all seven, enforced by a test:

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

**Session handoff.** Each skill must update `implement-status.md` when the
project has one, then print a short copy-paste prompt for the next session. This
keeps long work resumable without re-reading the whole history, which saves
tokens.

**Single source.** The rules live in `rules.md` at the repo root. `npm run
sync-rules` copies them into all seven `SKILL.md` files, and `npm test` fails if
any skill drifts. Never edit the copies.

**Always-on install.** The rules are also installed as an editor rules file, so
they apply to every reply and not only to slash commands:

| Editor | File | Notes |
| --- | --- | --- |
| Zed | `AGENTS.md`, or an existing `.rules` | Zed reads the first match in its filename list, so extend that file rather than adding one it would ignore. |
| Antigravity | `.agents/rules/calm-adhd.md` | Owned by this package, written whole. |
| Continue | `.continue/rules/calm-adhd.md` | Needs `alwaysApply: true`, and YAML frontmatter on line 1. |

`--no-rules` skips this. Shared files get a marker block so a re-run replaces
only our part.

---

## 2. CLI Installer Specifications

### Package Identity

- **NPM Package Name:** `calm-adhd-skills` (or `@your-scope/calm-adhd-skills`)
- **Binary Name:** `calm-adhd-skills`
- **Execution:** `npx calm-adhd-skills [options]`

### CLI Flags

| Flag | Behavior |
| --- | --- |
| `npx calm-adhd-skills --project` | Default. Installs skills into the current project directory (`./.agents/skills/`). |
| `npx calm-adhd-skills --global` | Installs skills into the user home directory (`~/.agents/skills/`). |
| `npx calm-adhd-skills --antigravity` | Installs where Antigravity reads. Same as `--project`; with `--global`, `~/.gemini/config/skills/`. |
| `npx calm-adhd-skills --continue` | Installs prompts to `./.continue/prompts/`, with `invokable: true` frontmatter. |

> **Paths verified 2026-09-04** against the editors' own docs. Two paths in the
> original draft were wrong and have been corrected here:
>
> - Antigravity has no `.antigravity/rules.md`. It reads workspace skills from
>   `.agents/skills/` — the same path Zed uses — and global skills from
>   `~/.gemini/config/skills/`.
> - Continue only lists a markdown prompt as a slash command when its
>   frontmatter sets `invokable: true`.

---

## 3. Directory Layout

The repository is organized so users can clone it directly or install it via `npx`:

```text
calm-adhd-skills/
├── bin/
│   └── cli.js                     # Installer script (Node.js)
├── package.json
├── README.md
├── PRD.md
└── skills/
    ├── analyze/
    │   └── SKILL.md
    ├── implement/
    │   └── SKILL.md
    ├── verify/
    │   └── SKILL.md
    ├── defend-code/
    │   └── SKILL.md
    ├── audit-infra/
    │   └── SKILL.md
    ├── harden-network/
    │   └── SKILL.md
    └── audit-logs/
        └── SKILL.md
```

---

## 4. Skills Specification (Prompt Definitions)

### 4.1 `/analyze`

**File:** `skills/analyze/SKILL.md`

**Purpose:** Inspect existing code and make an execution plan before touching any file.

````markdown
---
name: analyze
description: Read code, find risks, and make a plan. Do not edit code yet.
---

Analyze $ARGUMENTS (or the open files).

Task:
1. Target Files: Name the exact files and functions to modify.
2. Changes: List the exact changes needed in short bullet points.
3. Security Checks: Name any security risks to watch out for.
4. Test Strategy: Name the exact test command to verify this change.

Rules:
- Write in simple, short English.
- Do NOT edit or write code yet.
- Wait for the user to say "proceed" or run /implement.
````

---

### 4.2 `/implement`

**File:** `skills/implement/SKILL.md`

**Purpose:** Apply approved changes and run a Blue Team self-audit.

````markdown
---
name: implement
description: Make the planned changes and check for security bugs.
---

Apply the changes approved from the /analyze step: $ARGUMENTS

Task:
1. Edit only the required files.
2. Self-Audit Checklist:
   - Validate and sanitize all user inputs.
   - Check that no API keys, tokens, or passwords are hardcoded.
   - Ensure errors do not leak internal database info.
3. Fix any security flaw immediately in the code.

Rules:
- Write clean code with simple comments.
- Do not run test suites yet (wait for /verify).
- Keep the final summary under 3 short sentences.
````

---

### 4.3 `/verify`

**File:** `skills/verify/SKILL.md`

**Purpose:** Run terminal tests safely without looping on errors.

````markdown
---
name: verify
description: Run test suites and stop if commands fail.
---

Run test verification for the recent changes: $ARGUMENTS

Task:
1. Run the test command provided in $ARGUMENTS (or default project test runner).
2. If tests pass, print "All tests passed" and summarize changes in 2 lines.
3. If tests fail:
   - Read the error log.
   - You have 1 attempt to fix the error and re-run.
   - Strict Stop Rule: If any command fails twice, STOP immediately. Do not keep
     trying. Show the error log and ask the user for help.

Rules:
- Write in simple English.
- Never loop terminal commands repeatedly.
````

---

### 4.4 `/defend-code`

**File:** `skills/defend-code/SKILL.md`

**Purpose:** Audit backend code for vulnerabilities and patch them.

````markdown
---
name: defend-code
description: Find security flaws in code and write secure patches.
---

You are a Blue Team security engineer.
Audit the code in $ARGUMENTS or the active file.

Task:
1. Vulnerability List: Spot OWASP Top 10 flaws (SQL injection, XSS, bad auth,
   broken tokens).
2. Explain: Explain the danger in 1-2 simple sentences.
3. Patch: Rewrite the vulnerable function using secure coding practices
   (parameterized queries, input validation).

Rules:
- Simple English only.
- Never write attack scripts or exploits. Only provide defensive fixes.
````

---

### 4.5 `/audit-infra`

**File:** `skills/audit-infra/SKILL.md`

**Purpose:** Audit Docker Compose files and Linux service settings.

````markdown
---
name: audit-infra
description: Hardens Docker and Linux container configurations.
---

You are a Blue Team infrastructure engineer.
Audit the container or server configs in $ARGUMENTS.

Task:
1. Check for insecure settings:
   - Running container as root user.
   - Ports open to 0.0.0.0 unnecessarily.
   - Missing CPU/RAM limits.
   - Plaintext environment passwords.
2. Output a ready-to-use, hardened configuration file.

Rules:
- Use simple English.
- Provide direct copy-paste YAML or config files.
````

---

### 4.6 `/harden-network`

**File:** `skills/harden-network/SKILL.md`

**Purpose:** Build strict firewall and network rules.

````markdown
---
name: harden-network
description: Generate least-privilege firewall rules (UFW/iptables).
---

You are a Blue Team network defense engineer.
Review the firewall setup or port request in $ARGUMENTS.

Task:
1. Apply the least-privilege principle (block all inbound ports by default).
2. Allow only required ports (e.g., 80/443 for web, restricted port for
   SSH/admin).
3. Provide exact copy-paste terminal commands for UFW or iptables.

Rules:
- Write simple English explanations.
- Always include a warning if a rule risks locking the user out of SSH.
````

---

### 4.7 `/audit-logs`

**File:** `skills/audit-logs/SKILL.md`

**Purpose:** Scan server logs to spot brute-force attacks and scans.

````markdown
---
name: audit-logs
description: Analyze server access logs and create block rules.
---

You are a Blue Team incident responder.
Analyze the access/error logs in $ARGUMENTS.

Task:
1. Findings: List suspicious behavior (brute force, directory traversal,
   endpoint scanning).
2. Bad IPs: List attacker IPs and request patterns.
3. Defense Rule: Generate an immediate Fail2ban filter or Nginx rate-limiting
   block rule.

Rules:
- Write short, clear sentences.
- Avoid theoretical essays; give direct blocking rules.
````

---

## 5. CLI Implementation Guide (`bin/cli.js`)

The CLI copies the template folders from the package to the user's directory:

> **Note:** The snippet below is the minimal reference implementation. The
> shipped `bin/cli.js` builds on it and handles all four flags from Section 2,
> plus `--help` and `--version`.

```javascript
#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

const isGlobal = process.argv.includes('--global');
const targetBase = isGlobal
  ? path.join(process.env.HOME || process.env.USERPROFILE, '.agents', 'skills')
  : path.join(process.cwd(), '.agents', 'skills');

const skillsSource = path.join(__dirname, '..', 'skills');

if (!fs.existsSync(skillsSource)) {
  console.error('Skills source directory not found.');
  process.exit(1);
}

fs.cpSync(skillsSource, targetBase, { recursive: true });
console.log(`\x1b[32m✔ Skills installed successfully to: ${targetBase}\x1b[0m`);
console.log('Available slash commands:');
console.log('  /analyze, /implement, /verify, /defend-code, /audit-infra, /harden-network, /audit-logs');
```

---

## 6. How to Test Your Skills

### 6.1 Test in Zed

1. Run a local install inside your project:

   ```bash
   node bin/cli.js
   ```

2. Check that the folder exists:

   ```bash
   ls .agents/skills/
   ```

3. Open Zed in that folder.
4. Press `Ctrl + ?` (or `Cmd + ?`) to open the Agent panel.
5. Type `/` — you will see `/analyze`, `/implement`, `/verify`, etc., in the autocomplete list.
6. Run a test query:

   ```text
   /analyze src/auth.ts and I want to add rate limiting
   ```

### 6.2 Test in VS Code (Continue Extension)

1. Install the prompts into `.continue/prompts/`:

   ```bash
   npx calm-adhd-skills --continue
   ```

   Each skill is written as `<name>.md` so the files do not collide. Add
   `--global` to install into `~/.continue/prompts/` instead.

2. Open the Continue chat panel (`Ctrl + L`).
3. Type `/analyze` to verify the command autocompletes.

### 6.3 Test in Google Antigravity

Antigravity reads workspace skills from `.agents/skills/`, the same path Zed
uses, so the default install already covers it. Global skills go to
`~/.gemini/config/skills/` instead.

1. Run `npx calm-adhd-skills` (or `--global --antigravity` for every workspace).
2. Ask the agent something that matches a skill description. Antigravity picks
   skills by description rather than by slash command:

   ```text
   /defend-code check our database connection file
   ```

3. Verify that the agent outputs a safe code diff without generating exploit payloads.

---

## 7. Next Steps

This repository is **independent**, not a fork. It was scaffolded from this
document. `ayghri/i-have-adhd` is credited as prior art in the README for the
ADHD-friendly output idea, but no code, history, or files are shared with it.

Remaining before publishing:

1. Add a `LICENSE` file with a real copyright holder.
2. Fill in `author` and `repository` in `package.json`.
3. Confirm `calm-adhd-skills` is free on the npm registry.
4. Test in the real editors (Section 6). The install paths are confirmed from
   the editors' docs, but have not been exercised by hand.
5. `npm pack`, inspect the tarball, then publish.

### 7.1 Out of scope for now

Broader host support. Other projects in this space ship plugin manifests for
Claude Code, Cursor, opencode, and the Gemini / Qwen / Kimi extension formats.
This package targets `npx` into Zed, Antigravity, and Continue only. Revisit
once the npx path is published and proven.
