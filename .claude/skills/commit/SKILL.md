---
name: commit
description: Commit changes without any Claude attribution
argument-hint: <commit message>
---

Commit changes with NO Claude attribution:

1. Run `git status` to see changes
2. Run `git diff --stat` to understand what changed
3. Stage all relevant changes with `git add`
4. Create commit with the provided message or generate an appropriate one
5. IMPORTANT: Do NOT add any Claude co-author, attribution, or generated-by footer
6. Use a simple commit message without any AI attribution

Example commit command:
```bash
git commit -m "feat: your commit message here"
```

NEVER include:
- Co-Authored-By: Claude
- Generated with Claude Code
- Any mention of AI or Claude
