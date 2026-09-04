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
- Line 1 is the next action. Put nothing above it.
- Number the steps when the work has more than one.
- One idea per line. Short sentences.
- Give a real time estimate per step, like "about 5 minutes".
- Leave out tangents, history, and theory.
- Close with two lines: what is done, what is left.
