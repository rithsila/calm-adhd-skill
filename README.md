# Calm-ADHD Skills

Standard slash commands for AI coding editors. Install once, then type `/analyze`
in Zed, Antigravity, or VS Code (Continue).

Two things it gives you:

1. **A safe 3-step flow** — `/analyze` → `/implement` → `/verify`. Plan first,
   code second, test last. No surprise edits.
2. **Blue Team defense commands** — `/defend-code`, `/audit-infra`,
   `/harden-network`, `/audit-logs`. Defensive fixes only, never exploits.

Every skill answers in simple, short English. All seven end with the same 11
output rules — next action on line 1, numbered steps, lists capped at 5, time
estimates in minutes, no preamble, no recap, no closers.

They also share a **session handoff** rule: update `implement-status.md`, then
print a copy-paste prompt for the next session. Long work stays resumable
without re-reading the whole history.

The rules live in one file, [`rules.md`](rules.md). The installer puts them in
your project as an **always-on rules file**, so they apply to every reply — not
only when you type a slash command.

---

## Install

Install into the current project (default):

```bash
npx calm-adhd-skills
```

Install for every project on your machine:

```bash
npx calm-adhd-skills --global
```

| Flag | What it does |
| --- | --- |
| `--project` | Default. Writes skills to `./.agents/skills/`. Zed and Antigravity both read this. |
| `--global` | Writes skills to `~/.agents/skills/`. |
| `--antigravity` | Installs where Antigravity reads. Same as `--project`; with `--global`, `~/.gemini/config/skills/`. |
| `--continue` | Writes prompts to `./.continue/prompts/`, marked `invokable: true`. |
| `--no-rules` | Install the skills only. Skip the always-on rules files. |
| `--help` | Show all options. |

The rules are installed here:

| Editor | File |
| --- | --- |
| Zed | `AGENTS.md`, or your existing `.rules` file if you have one |
| Antigravity | `.agents/rules/calm-adhd.md` |
| Continue | `.continue/rules/calm-adhd.md` (`alwaysApply: true`) |

`AGENTS.md` and `.rules` are yours, so the block goes between HTML markers. A
re-run replaces only that block. Everything else you wrote stays.

You can combine flags. `--global` only changes *where* things go, so
`--global --continue` writes the Continue prompts to `~/.continue/prompts/`. Name
every target you want: `--global --project --continue` installs both the skills
and the prompts under your home directory.

Installing twice is safe — it overwrites the skill files and touches nothing
else.

---

## The commands

| Command | What it does |
| --- | --- |
| `/analyze` | Reads the code, lists risks, and writes a plan. Edits nothing. |
| `/implement` | Applies the approved plan and runs a security self-audit. |
| `/verify` | Runs the tests. Stops after 2 failures instead of looping. |
| `/defend-code` | Finds OWASP Top 10 flaws and writes the secure patch. |
| `/audit-infra` | Hardens Docker Compose and Linux service configs. |
| `/harden-network` | Writes least-privilege UFW / iptables rules. |
| `/audit-logs` | Reads access logs and writes Fail2ban or Nginx block rules. |

---

## Use it

Start with a plan:

```text
/analyze src/auth.ts and I want to add rate limiting
```

Read the plan. If it looks right:

```text
/implement
```

Then check your work:

```text
/verify npm test
```

---

## Editor setup

### Zed

1. Install into your project, then open the folder in Zed.
2. Press `Cmd + ?` (or `Ctrl + ?`) to open the Agent panel.
3. Type `/` — the commands appear in the autocomplete list.

### VS Code (Continue extension)

1. Run `npx calm-adhd-skills --continue`.
2. Open the Continue chat panel with `Ctrl + L`.
3. Type `/analyze` to check that it autocompletes.

### Google Antigravity

Antigravity reads `.agents/skills/` — the same path as Zed — so the default
install already covers it.

1. Run `npx calm-adhd-skills` (or `--global --antigravity` for every workspace).
2. Ask for something matching a skill, e.g. `check our database connection file
   for security bugs`. Antigravity chooses a skill from its description rather
   than by slash command.
3. The agent should return a safe code diff, not an exploit.

---

## Develop locally

```bash
git clone <your-repo-url> calm-adhd-skills
cd calm-adhd-skills
node bin/cli.js          # install into this folder
ls .agents/skills/       # check the files landed
```

To edit a command, change the matching `skills/<name>/SKILL.md` and run the
installer again.

To edit the shared rules, change `rules.md` — never the copies inside the
skills — then run:

```bash
npm run sync-rules
```

`npm test` fails if a skill has drifted from `rules.md`.

Run the tests before you push:

```bash
npm test
```

They exercise every flag in a temp directory and clean up after themselves.

---

## Layout

```text
calm-adhd-skills/
├── bin/
│   └── cli.js          # Installer script (Node.js, no dependencies)
├── rules.md            # Single source for the shared output rules
├── scripts/
│   └── sync-rules.js   # Copies rules.md into all 7 skills
├── skills/
│   ├── analyze/SKILL.md
│   ├── implement/SKILL.md
│   ├── verify/SKILL.md
│   ├── defend-code/SKILL.md
│   ├── audit-infra/SKILL.md
│   ├── harden-network/SKILL.md
│   └── audit-logs/SKILL.md
├── docs/
│   ├── PRD.md          # Full product requirements
│   └── implement-status.md   # What is done, what is pending
├── package.json
└── README.md
```

Requires Node 18 or newer. No runtime dependencies.

---

## Prior art

The ADHD-friendly output idea is not ours. [ayghri/i-have-adhd](https://github.com/ayghri/i-have-adhd)
(MIT) does that job well and across many more hosts.

This project is independent — separate code, separate history, no shared files.
It borrows the idea of shaping output for a reader with ADHD and applies it to a
fixed set of DevSecOps commands. If you want output shaping on its own, use
i-have-adhd instead.

---

## License

MIT
