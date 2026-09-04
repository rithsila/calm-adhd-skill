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

Output style:
- Line 1 is the next action. Put nothing above it.
- Number the steps when the work has more than one.
- One idea per line. Short sentences.
- Give a real time estimate per step, like "about 5 minutes".
- Leave out tangents, history, and theory.
- Close with two lines: what is done, what is left.
