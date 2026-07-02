---
name: fantasia-final-cleanup
description: >-
  End-of-batch ship workflow for Fantasia Archive: run full yarn testbatch:verify
  (not dev scoped gate), fix failures, sync README/AGENTS/rules/skills from Git
  changes, update in-app changelog, split conventional commits, and git push. Use
  when the user says final cleanup, doing final cleanup, run final cleanup,
  wrap up and ship, or similar end-of-session handoff language.
---

# Final cleanup — ship the current batch

Execute **in this exact order**. Do not skip, merge, or reorder unless user interrupts with narrower instruction.

Final cleanup = explicit handoff: may **commit and push** without per-commit approval (unlike default in [git-conventional-commits](../git-conventional-commits/SKILL.md)). Still conventional **`type: subject`** + logical splits.

## Step 1 — Full verify quality gate

One terminal — **full** gate only here (not default after ordinary edits; see [dev-scoped-verify.mdc](../../rules/dev-scoped-verify.mdc)):

```bash
yarn testbatch:verify
```

- Stop on **first** failure; report what failed + where
- Debug individual steps from [testing-terminal-isolation.mdc](../../rules/testing-terminal-isolation.mdc), then re-run full chain
- Do **not** append Playwright, Electron prod build, or Storybook unless user asked **`yarn testbatch:ensure:nochange`** or **`yarn testbatch:ensure:change`**

## Step 2 — Fix issues

- Step 1 failed → fix root causes, re-run **`yarn testbatch:verify`** until green
- Step 1 passed → step 3
- No changelog/commit until verify green (except rare changelog-only repair — [testing-terminal-isolation.mdc](../../rules/testing-terminal-isolation.mdc))

## Step 3 — Sync maintainer docs from Git

Inspect working tree + diff (`git status`, `git diff`, `git diff --staged`):

| Area | When to update |
|------|----------------|
| `README.md` | New scripts, test commands, architecture, contributor workflows |
| `AGENTS.md` | New subsystems, rules, skills, testing expectations, repo layout |
| `.cursor/rules/*.mdc` | New enforced policies or rule corrections |
| `.cursor/skills/**/SKILL.md` | New playbooks or materially changed workflows |
| `docs/database/**` | **`.faproject`** schema, migrations, project IPC, **`electron-store`** persistence |

- Match existing tone/structure; no drive-by rewrites unrelated to diff
- Omit doc edits when batch trivial + already covered elsewhere
- Synced maintainer docs (**`README.md`**, **`AGENTS.md`**, **`.cursor/rules/`**, **`.cursor/skills/`**) use **caveman style** per [AGENTS.md](../../../AGENTS.md) maintainer doc policy ([caveman-compress](../../../.agents/skills/caveman-compress/SKILL.md))
- **`docs:`** commits may group README + AGENTS + rules + skills when same batch

## Step 4 — Changelog

Before product commit:

1. Re-read [package.json](../../../package.json) **`version`** (never auto-bump)
2. [fantasia-changelog-en-us](../fantasia-changelog-en-us/SKILL.md) + [changelog-en-us.mdc](../../rules/changelog-en-us.mdc)
3. User-facing **`src/components/**`**: Storybook aligned ([storybook-stories.mdc](../../rules/storybook-stories.mdc))
4. Prefer **same commit** as substantive work; user bullets only — no QA/Git meta

Mirror **`i18n/*/documents/changeLog.md`** in other locales **only when user explicitly asks**; default = **`en-US`** only.

## Step 5 — Commit in logical batches

1. `git status` + full diff review
2. Ordered commit plan (type, subject, paths). Show plan briefly, then **execute** unless user objects
3. Split: `feat` / `fix` / `test` / `chore` / `refactor` / `docs` per [git-conventional-commits](../git-conventional-commits/SKILL.md)
4. Typical order: `chore`/`refactor` before `feat`/`fix`; product + tests + changelog together; `docs:` for maintainer-only; VRT PNGs with UI change
5. Never commit secrets; never **`--no-verify`** unless user asks
6. After each commit: `git status` until clean

## Step 6 — Push

When commits done + tree clean:

```bash
git push
```

`-u origin <branch>` when no upstream. Push fails → report + stop; no force-push **`main`**/**`master`** unless user asks.

## Reporting

Summarize in execution order: verify gate → fixes → docs/changelog touched → each commit → push result.

## Related

- [dev-scoped-verify.mdc](../../rules/dev-scoped-verify.mdc) — default during edits; **not** step 1 here
- [final-cleanup.mdc](../../rules/final-cleanup.mdc)
- [testing-terminal-isolation.mdc](../../rules/testing-terminal-isolation.mdc)
- [git-conventional-commits](../git-conventional-commits/SKILL.md)

## Types

Shared types → **`types/`**. See [types-folder.mdc](../../rules/types-folder.mdc).
