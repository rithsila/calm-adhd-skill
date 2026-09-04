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
