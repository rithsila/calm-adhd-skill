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
