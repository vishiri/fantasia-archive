---
name: fantasia-neverthrow
description: >-
  Use the neverthrow Result / ResultAsync pattern instead of try/catch for
  recoverable failures. Apply when touching error paths, IPC wrappers, parsers,
  or refactors around thrown errors.
---

# Neverthrow error handling

## When to follow

- Editing or adding TypeScript/JavaScript/Vue logic that handles **anticipated** failures (IPC, **`JSON.parse`** / stringify edge cases, user-driven cancellation, clipboard, optional APIs).
- Refactoring legacy **`try`** / **`catch`** or bare **`.catch(() => {})`** swallow patterns.

See [neverthrow.mdc](../../../.cursor/rules/neverthrow.mdc) for repo policy.

## Core API (Neverthrow v8)

- **`ok(value)`**, **`err(error)`**: build **`Result`** values.
- **`Result.fromThrowable(fn, mapError)`**: wrap sync code that throws; **`mapError`** maps **`unknown`** to the **`E`** type (often **`undefined`** or a string token).
- **`ResultAsync.fromPromise(promise, mapError)`**: wrap rejecting promises; **`fromSafePromise`** when rejection is unexpected.
- **`result.match(okFn, errFn)`**, **`unwrapOr`**, **`map`**, **`mapErr`**, **`andThen`**, **`orElse`**.
- **`safeTry`**: generator-style **`yield* result`** for sequential **`Result`** steps (Rust **`?`**-like flow).

Prefer **`finally`** callbacks on **`Promise`** chains when you only need side-effect cleanup, so you avoid **`try`** / **`finally`** where **`Result`** owns the branching.

## Preload exclusion

**`src-electron/contentBridgeAPIs/**`** is bundled into the sandboxed preload script. **Do not import `neverthrow` there.** Use **`Promise.then` / `.catch`**, **`URL.canParse`**, early returns, and similar plain patterns instead. **`src-electron/shared/**`** modules reachable from preload must follow the same rule. **Renderer**, **main**, and **`helpers/`** trees still prefer **`Result`** / **`ResultAsync`** per [neverthrow.mdc](../../../.cursor/rules/neverthrow.mdc).

## Links

- [neverthrow documentation](https://www.npmjs.com/package/neverthrow) (npm readme and upstream repo examples).
