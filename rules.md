# Calm-ADHD output rules

This file is the single source of truth for the output rules.

Two things use it:

1. Every `skills/*/SKILL.md` ends with the block below. Run `npm run sync-rules`
 after editing this file. A test fails if any skill drifts.
2. The installer writes it as an always-on rules file, so the rules apply to
 every reply — not only when a slash command runs.

Where it gets installed:


| Editor      | Path                                                                     |
| ----------- | ------------------------------------------------------------------------ |
| Zed         | `AGENTS.md` in the project root, or `.rules` if that file already exists |
| Antigravity | `.agents/rules/calm-adhd.md`                                             |
| Continue    | `.continue/rules/calm-adhd.md`, with `alwaysApply: true`                 |


Everything from `Output style:` down is the canonical block. Do not put anything
after it.

---

Output style:

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

Session handoff:

- Update `implement-status.md` if the project has one. Mark what is done.
List what is left.
- Then print a short copy-paste prompt the user can send next session to
pick up the remaining work.

