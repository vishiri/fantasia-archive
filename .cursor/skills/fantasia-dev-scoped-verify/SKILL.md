---
name: fantasia-dev-scoped-verify
description: >-
  Default post-edit verification for Fantasia Archive agents: ESLint on touched
  paths, full vue-tsc, stylelint on touched styles, and yarn vitest run only on
  specs connected to the edit batch. Full yarn testbatch:verify is reserved for
  final cleanup, git commit, and explicit user requests. Use after substantive
  code edits before reporting work done.
---

# Dev scoped verify

Default agent gate after substantive edits. **Not** **`yarn testbatch:verify`**.

Full gate when: [final-cleanup.mdc](../../rules/final-cleanup.mdc), user asks full verify/ensure, or **`git commit`** ([git-conventional-commits.mdc](../../rules/git-conventional-commits.mdc)).

Rule: [dev-scoped-verify.mdc](../../rules/dev-scoped-verify.mdc). Compile smoke: [dev-electron-compile-check.mdc](../../rules/dev-electron-compile-check.mdc).

## One terminal (stop first failure)

```bash
yarn eslint <touched-paths...> --max-warnings 0
yarn lint:typescript
# stylelint only when *.vue/css/scss touched:
yarn lint:stylelint -- <touched-style-paths...>
yarn vitest run <connected-spec-paths...>
```

No **`yarn test:coverage:verify`** in scoped gate.

## Discover touched paths

From edit batch (staged + unstaged):

- Production: **`src/**`**, **`src-electron/**`**, **`types/**`**, **`i18n/**`**, **`helpers/**`** (exclude **`playwrightHelpers_*`** unless Playwright harness edited), **`.storybook-workspace/**`**, configs, tests.
- Group by feature folder: e.g. **`ProjectHierarchyTree/`** → eslint whole folder if any file under it changed.

## Discover connected Vitest specs

For **each** touched production module (not test-only edits):

1. **Colocated** — same tree **`_tests/*.vitest.test.ts`**, **`scripts/_tests/*.vitest.test.ts`**.
2. **SFC** — **`src/components|layouts|pages/<Feature>/_tests/<Name>.vitest.test.ts`** matching **`.vue`** basename.
3. **Ripgrep importers** — basename or exported symbol from touched **`.ts`** in **`**/*.vitest.test.ts`**.
4. **Types** — **`types/<Module>.ts`** → specs importing **`app/types/...`** path.
5. **i18n** — locale file touched → **`i18n/_tests/**`** specs for that locale or key family.
6. **Stores / IPC** — grep store id, IPC channel string, action id in **`_tests/`**.

Deduplicate paths. If zero specs found but production logic changed → add colocated spec per [fantasia-testing](../fantasia-testing/SKILL.md) or run narrowest Vitest project slice (**`yarn test:coverage:electron`** etc.) only while debugging; prefer writing/running colocated test.

**Test-only batch** — run edited **`*.vitest.test.ts`** + specs that import shared fixtures from same **`_tests/`** folder.

## Escalate to full verify

Same turn → **`yarn testbatch:verify`** when batch touches:

- **`eslint.config.mjs`**, **`vitest.config.mts`**, **`vitest/**`**, coverage gate scripts
- **`package.json`** dependencies or scripts affecting lint/test toolchain
- Wide refactor with no practical connected set (many projects)

## After scoped gate

Separate terminal: **20s** **`yarn quasar:dev:electron`** smoke ([dev-electron-compile-check.mdc](../../rules/dev-electron-compile-check.mdc)).

## Playwright / Storybook

Scoped gate **excludes** Playwright and Storybook. Feature UX change → discover per [fantasia-testing](../fantasia-testing/SKILL.md) **Connected tests**; run in **own** terminals after **`yarn quasar:build:electron`**. Full ship: **`yarn testbatch:ensure:nochange`** or final cleanup path.

## Reporting

State: eslint paths, whether stylelint ran, vitest spec list, pass/fail. Do not equate with full verify or CI green.
