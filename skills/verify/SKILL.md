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
- Line 1 is the next action. Put nothing above it.
- Number the steps when the work has more than one.
- One idea per line. Short sentences.
- Give a real time estimate per step, like "about 5 minutes".
- Leave out tangents, history, and theory.
- Close with two lines: what is done, what is left.
