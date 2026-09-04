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
