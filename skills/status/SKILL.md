---
name: status
description: Build or update implement-status.md from the PRD and the real repo state. Use to track what is done, what is left, and what blocks it.
---

Build or update `implement-status.md` from the project's PRD.

Input: $ARGUMENTS is the path to the PRD. If empty, look for `PRD.md`,
`docs/PRD.md`, or the closest match. If you find none, stop and ask.

Task:
1. Read the PRD. List every deliverable it asks for.
2. Check the repo for each one. Read the file tree, `git log`, and run the test
   command. Never mark work done from the PRD alone.
3. Write `implement-status.md` using the template below.
4. If the file exists, keep every row in its Decisions log. Add rows. Never
   delete or reword old ones.
5. End with the copy-paste prompt for the next session.

Rules:
- Mark a task done only when you saw proof in the repo. Say how you checked.
- If you could not check something, write "not verified". Do not guess.
- Give each pending task a stable ID: P1, P2, P3. Never renumber an old ID.
- Split pending work into blocked and ready. Name who or what blocks it.
- Do not invent tasks the PRD does not ask for.
- Keep a task in Pending until it is proven done. A written file is not a
  passing test.

Template:

````markdown
# Implementation Status

Tracks the build of <project> against [PRD.md](./PRD.md).

- **Last updated:** <YYYY-MM-DD>
- **Version:** <version, and whether it shipped>
- **Overall:** <one line: where the work stands>

Legend: ✅ done · 🟡 partly done · ⬜ not started

## 1. Summary

| Area | Status |
| --- | --- |
| <one row per PRD area> | ✅ Done |

## 2. Completed

### 2.1 <area>

- ✅ <what shipped> — <how you verified it>

## 3. Pending

### 3.1 Blocked

| # | Task | Why it is blocked |
| --- | --- | --- |
| P1 | <task> | <who or what unblocks it> |

### 3.2 Ready to do

| # | Task | Notes |
| --- | --- | --- |
| P2 | <task> | <first step> |

## 4. Known risks

- **<risk>** — <what goes wrong, and what would prove it safe>

## 5. Decisions log

| Date | Decision | Reason |
| --- | --- | --- |
| <YYYY-MM-DD> | <what was decided> | <why, in one line> |

## 6. Next session

```
<copy-paste prompt naming the next task IDs and the files to touch>
```
````

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
