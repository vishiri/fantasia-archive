---
name: fantasia-yagni
description: >-
  YAGNI and minimal diffs inside Fantasia mandatory structure: reuse ladder,
  no unrequested features or deps, shortest change that passes gates. Apply when
  scoping work, reviewing bloat, or choosing reuse vs greenfield.
---

# YAGNI — implementation discipline

## When to follow

- New feature, refactor, or dependency choice
- User request sounds heavy — check reuse first
- Diff review: duplicate util, speculative abstraction, parallel pattern

Always-on rule: [yagni.mdc](../../rules/yagni.mdc). **Precedence:** other **`.cursor/rules/*`** and **`fantasia-*`** skills win on structure, tests, i18n, gates.

## Ladder (summary)

1. Need build at all?
2. Already in codebase?
3. Stdlib / platform?
4. Installed **`package.json`** dep?
5. Minimum inside conventions — shortest diff passing dev scoped gate ([dev-scoped-verify.mdc](../../rules/dev-scoped-verify.mdc)); full **`yarn testbatch:verify`** at commit/final cleanup

Trace real flow before picking rung. Mandatory two-level, **`types/`**, Vitest/Playwright/Storybook, neverthrow, line caps — **not** skippable for brevity.

## Orthogonal to caveman

| Layer | Rule / skill | Job |
| --- | --- | --- |
| Replies | [caveman-default.mdc](../../rules/caveman-default.mdc), **`.agents/skills/caveman/`** | Terse agent prose |
| Code | [yagni.mdc](../../rules/yagni.mdc) | Minimal correct implementation |

Both can stay on. YAGNI does not replace caveman or **cavemem** hooks.

## Links

- [code-size-decomposition.mdc](../../rules/code-size-decomposition.mdc) — fewer modules until line caps force split
- [fa-two-level-architecture.mdc](../../rules/fa-two-level-architecture.mdc)
- [fantasia-dev-scoped-verify](../fantasia-dev-scoped-verify/SKILL.md) — default post-edit gate
- [fantasia-testing](fantasia-testing/SKILL.md) — connected tests + full gate at ship
