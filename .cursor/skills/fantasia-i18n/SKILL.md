---
name: fantasia-i18n
description: >-
  Manages vue-i18n messages and locale structure for Fantasia Archive. Use when
  adding or changing user-facing strings, locale files under src/i18n, or
  markdown-backed documents wired into i18n.
---

# Fantasia Archive — i18n

## Setup

- **Plugin**: `vue-i18n` v9.
- **Locale registry**: `src/i18n/index.ts` exports locale keys (e.g. `en-US`, `de`) and merges each locale module.

## English structure (`src/i18n/en-US/`)

- **`index.ts`**: Composes the default export — global `documents` (imported `.md` strings), `app`, page keys (`ErrorNotFound`, …), and nested `T_*` modules for menus, dialogs, and components.
- **Component/dialog strings**: Prefer dedicated `T_<feature>.ts` files under `en-US/components/...` or `en-US/dialogs/...` and import them into `index.ts` for a clear tree.
- **Markdown documents**: Live under `en-US/documents/` as `.md` files; imported in `index.ts` and often passed through `specialCharacterFixer` from `src/i18n/specialCharactersFixer.ts`.

## Adding strings

1. Choose the right namespace (global vs component-specific `T_*` module).
2. Add keys in TypeScript modules or inline in `index.ts` for small additions.
3. Mirror structure in other active locales (`de`, etc.) when those are maintained.

## Related

- [fantasia-markdown-dialogs](../fantasia-markdown-dialogs/SKILL.md) for rendering markdown in dialogs.
