# Calm-ADHD Skills

Standard slash commands for AI coding editors. Install once, then type `/analyze`
in Zed, Antigravity, or VS Code (Continue).

Two things it gives you:

1. **A safe 3-step flow** — `/analyze` → `/implement` → `/verify`. Plan first,
   code second, test last. No surprise edits.
2. **Blue Team defense commands** — `/defend-code`, `/audit-infra`,
   `/harden-network`, `/audit-logs`. Defensive fixes only, never exploits.

Every skill answers in simple, short English. No jargon, no long essays.

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
| `--project` | Default. Writes skills to `./.agents/skills/`. |
| `--global` | Writes skills to `~/.agents/skills/`. |
| `--antigravity` | Appends the rules to `./.antigravity/rules.md`. |
| `--continue` | Writes prompts to `./.continue/prompts/`. |
| `--help` | Show all options. |

You can combine flags. `--global` only changes *where* things go, so
`--global --continue` writes the Continue prompts to `~/.continue/prompts/`. Name
every target you want: `--global --project --continue` installs both the skills
and the prompts under your home directory.

Re-running `--antigravity` replaces its own block in `rules.md`. Your own rules
in that file are left alone.

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

1. Run `npx calm-adhd-skills --antigravity`.
2. In the prompt bar, type `/defend-code check our database connection file`.
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

## License

MIT
