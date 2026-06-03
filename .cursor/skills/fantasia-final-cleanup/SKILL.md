---
name: fantasia-final-cleanup
description: >-
  End-of-batch ship workflow for Fantasia Archive: run yarn testbatch:verify and
  fix failures, sync README/AGENTS/rules/skills from Git changes, update in-app
  changelog, split conventional commits, and git push. Use when the user says
  final cleanup, doing final cleanup, run final cleanup, wrap up and ship, or
  similar end-of-session handoff language.
---

# Final cleanup — ship the current batch

Execute these steps **in this exact order**. Do not skip, merge, or reorder unless the user interrupts with a narrower instruction.

Final cleanup is an explicit handoff: you may **commit and push** without asking for per-commit approval (unlike the default in [git-conventional-commits](../git-conventional-commits/SKILL.md)). Still use conventional `type: subject` messages and logical splits.

## Step 1 — Verify quality gate

In **one** terminal:

```bash
yarn testbatch:verify
```

- Stop on the **first** failure; report what failed and where.
- While debugging, run individual steps from [testing-terminal-isolation.mdc](../../rules/testing-terminal-isolation.mdc) only for the failing slice, then re-run the full **`yarn testbatch:verify`** chain.
- Do **not** append Playwright, Electron production build, or Storybook to this chain unless the user separately asked for **`yarn testbatch:ensure:nochange`** or **`yarn testbatch:ensure:change`**.

## Step 2 — Fix issues

- If step 1 failed: fix root causes, re-run **`yarn testbatch:verify`** until it passes.
- If step 1 passed: continue to step 3.
- Do not edit changelog or commit until the verify gate is green (except rare changelog-only repair after a prior green verify — see [testing-terminal-isolation.mdc](../../rules/testing-terminal-isolation.mdc)).

## Step 3 — Sync maintainer docs from Git

Inspect the working tree and recent diff (`git status`, `git diff`, `git diff --staged`):

| Area | When to update |
|------|----------------|
| `README.md` | New scripts, test commands, architecture, or contributor workflows touched by the batch |
| `AGENTS.md` | New subsystems, rules, skills, testing expectations, or repo layout changes |
| `.cursor/rules/*.mdc` | New enforced policies or corrections to existing rule text |
| `.cursor/skills/**/SKILL.md` | New playbooks or materially changed workflows |
| `docs/database/**` | **`.faproject`** schema, migrations, project content IPC, or **`electron-store`** persistence changed |

- Match existing tone and structure; avoid drive-by rewrites unrelated to the diff.
- Omit doc edits when the batch is trivial and already covered elsewhere.
- **`docs:`** commits may group README + AGENTS + rules + skills when they describe the same batch.

## Step 4 — Changelog

Before any product commit:

1. Re-read [package.json](../../../package.json) for the live **`version`** (never auto-bump).
2. Follow [fantasia-changelog-en-us](../fantasia-changelog-en-us/SKILL.md) and [changelog-en-us.mdc](../../rules/changelog-en-us.mdc).
3. For user-visible **`src/components/**`** changes, confirm Storybook stories/mocks are aligned ([storybook-stories.mdc](../../rules/storybook-stories.mdc)) before changelog text.
4. Prefer **same commit** as substantive work; user-facing bullets only — no QA gate noise, no Git meta.

Mirror **`i18n/*/documents/changeLog.md`** under other locales when you maintain them.

## Step 5 — Commit in logical batches

1. `git status` and full diff review.
2. Propose an **ordered commit plan** (type, subject, paths per commit). Briefly show the plan to the user, then **execute** unless they object.
3. Split by concern: `feat` / `fix` / `test` / `chore` / `refactor` / `docs` per [git-conventional-commits](../git-conventional-commits/SKILL.md).
4. Typical order when multiple apply:
   - `chore` / `refactor` (tooling, harness) before `feat` / `fix`
   - product + tests + changelog together when one feature
   - `docs:` for README/AGENTS/rules/skills-only deltas
   - Storybook VRT snapshot PNGs with the UI change they belong to
5. Never commit secrets; never use `--no-verify` unless the user explicitly requests it.
6. After each commit, `git status` until the tree is clean (or only intentionally untracked files remain).

## Step 6 — Push

When all commits are done and the tree is clean:

```bash
git push
```

Use `-u origin <branch>` when the branch has no upstream. If push fails (auth, non-fast-forward), report the error and stop — do not force-push **`main`** / **`master`** unless the user explicitly asks.

## Reporting

Summarize in execution order:

1. Verify gate (pass/fail)
2. Fixes applied (if any)
3. Docs/changelog files touched
4. Each commit (`type: subject` + short scope)
5. Push result (remote, branch)

## Related

- Rule trigger: [final-cleanup.mdc](../../rules/final-cleanup.mdc)
- Quality gate: [testing-terminal-isolation.mdc](../../rules/testing-terminal-isolation.mdc)
- Commits (default approval loop): [git-conventional-commits](../git-conventional-commits/SKILL.md)

## TypeScript interfaces and types (`types/`)

- Put shared `interface` / `type` declarations in repository-root `types/` (import with `app/types/...`). Prefer one domain-oriented module per feature area with brief JSDoc on exports (see `types/I_appMenusDataList.ts`). Do not add colocated `<filename>.types.ts` under `src/`, `src-electron/`, or `.storybook-workspace/`. Ambient augmentations for third-party modules also live under `types/` and are loaded with a side-effect import from the owning boot file or `src/stores/index.ts` (see `types/piniaModuleAugmentation.ts`).
- For JavaScript (`.js`), TypeScript (`.ts`), Vue (`.vue`), and JSON (`.json`, `.jsonc`, `.json5`) files, enforce expanded multi-line object literals via ESLint (`object-curly-newline` + `object-property-newline`) and keep files auto-fixable with `eslint --fix`.
