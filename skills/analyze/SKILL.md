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
