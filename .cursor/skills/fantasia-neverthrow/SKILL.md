---
name: fantasia-neverthrow
description: >-
  Use the neverthrow Result / ResultAsync pattern instead of try/catch for
  recoverable failures. Apply when touching error paths, IPC wrappers, parsers,
  or refactors around thrown errors.
---

# Neverthrow error handling

## When to follow

- Anticipated failures: IPC, parse edge cases, cancellation, clipboard, optional APIs
- Refactoring legacy **`try`/`catch`** or swallowed **`.catch`**

See [neverthrow.mdc](../../../.cursor/rules/neverthrow.mdc).

## Core API (Neverthrow v8)

- **`ok(value)`**, **`err(error)`**
- **`Result.fromThrowable(fn, mapError)`**
- **`ResultAsync.fromPromise(promise, mapError)`**; **`fromSafePromise`** when rejection unexpected
- **`match`**, **`unwrapOr`**, **`map`**, **`mapErr`**, **`andThen`**, **`orElse`**
- **`safeTry`**: generator **`yield* result`** for sequential steps

Prefer **`finally`** on **`Promise`** chains for cleanup-only side effects.

## Preload exclusion

**`src-electron/contentBridgeAPIs/**`** — sandboxed preload bundle. **No `neverthrow` import.** Use **`Promise.then`/`.catch`**, **`URL.canParse`**, early returns. **`src-electron/shared/**`** reachable from preload: same rule. Renderer, main, **`helpers/`** still prefer **`Result`** / **`ResultAsync`**.

## Links

- [neverthrow documentation](https://www.npmjs.com/package/neverthrow)
