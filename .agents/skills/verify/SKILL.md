---
name: verify
description: The required loop for every code change before it is committed — quality check, end-to-end test, clean up, test again, pre-commit review. Use whenever you finish writing code, before saying a change is done or fixed, and before any commit, push or PR.
---

# Verify a change before commit

Run the five steps in order. A failure at any step means fix it, then start again from step 1.
Commit only after one clean run of all five.

1. **Quality check.** Run the `check` skill: `app:build`, lint, prettier on touched files. Add or
   update a test only where it pins real behaviour the change introduced.
2. **Test as a user.** Run the `e2e` skill on every matrix row the change touches. A build that
   passes proves the code compiles, not that the feature works.
3. **Clean and enhance.** Reread your own diff against `docs/reference/rules.md`: fix causes, not
   symptoms (no guards, fallbacks or special cases papering over a bug), delete dead code and
   duplication, keep names and copy plain. Format only the files you touched.
4. **Test again.** Repeat steps 1 and 2 on the same rows. Clean-ups break things.
5. **Before commit.** The diff holds only this task. No Claude co-author trailer. The branch is
   cut from `dev`. The PR description carries the e2e results table and HD screenshots
   (1600x900 at 2x) for anything visible.

End with the results: each step, pass or fail, and the e2e table.

A change that spans both repos runs this loop in each; the backend has its own `verify`.
