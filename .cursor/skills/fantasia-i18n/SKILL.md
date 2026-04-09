---
name: fantasia-i18n
description: >-
  Manages vue-i18n messages and locale structure for Fantasia Archive. Use when
  adding or changing user-facing strings, locale files under repo-root i18n/, or
  markdown-backed documents wired into i18n.
---

# Fantasia Archive — i18n

## Setup

- **Plugin**: `vue-i18n` v9.
- **Locale registry**: **`i18n/index.ts`** at the **repository root** (next to **`src/`**) exports locale keys (e.g. `en-US`, `de`) and merges each locale module. The Quasar app and **`externalFileLoader`** import it as **`app/i18n`**.
- **TypeScript**: global message schema augmentation lives in **`src/boot/i18n.ts`** (`declare module 'vue-i18n'`). Under **`yarn lint:typescript`**, **`tsc`** may report **TS2665** against the ESM `module` resolution; the boot file documents a **`@ts-expect-error`** for that line. Keep **`eslint-disable @typescript-eslint/no-empty-object-type`** on the augmentation block (typescript-eslint v8 rule name). See [eslint-typescript.mdc](../../rules/eslint-typescript.mdc).

## Folder structure (`i18n/en-US/`)

```
i18n/
  index.ts                 — merges en-US, fr, de, …
  externalFileLoader.ts      — standalone createI18n instance for Pinia / scripts
  specialCharactersFixer.ts  — escapes characters for vue-i18n message compiler
  tests/                     — Vitest specs (**unit-i18n**)
  en-US/
    index.ts                            — composes the full locale tree; no hardcoded strings (see rules below)
    documents/                          — Markdown source files (.md); imported via ?raw and passed through specialCharacterFixer
    components/<bucket>/<ComponentName>/ — mirrors src/components/: globals, elements, other (not foundation/; Storybook-only catalogues use inline English)
    dialogs/                            — one L_<DialogName>.ts per dialog (dialog copy; not the same as components/dialogs/)
    pages/                              — one L_<PageName>.ts per page
    globalFunctionality/                — one L_<feature>.ts per app-wide, non-component concern (e.g. store notifications)
```

Do not place locale files in any other location. If no folder fits, use `globalFunctionality/`.

**Naming**: locale message files use the **`L_` prefix** (for example `L_programSettings.ts`). TypeScript **type aliases** elsewhere in the app use **`T_`** per project conventions — do not use `T_` for locale filenames.

## Key naming rules

- All top-level keys exported from `index.ts` use **camelCase with a lowercase first letter** (e.g. `globalWindowButtons`, `appControlMenus`, `dialogs`, `errorNotFound`, `globalFunctionality`).
- Sub-keys within `L_*.ts` modules also use camelCase with a lowercase first letter.
- `index.ts` must contain no hardcoded user-visible strings; every string lives in a dedicated `L_*.ts` file.
- The `documents` section holds processed markdown strings, not static text — it is the only section that calls `specialCharacterFixer`; do not add plain string keys there. Those strings are still compiled as **vue-i18n** messages: avoid literal **`{...}`** in Markdown (for example glob **`.*.{vue,css}`**) or the in-app changelog and other document dialogs can throw **message compilation** errors — see [fantasia-changelog-en-us](../fantasia-changelog-en-us/SKILL.md).
- **vue-i18n** (Intlify) message syntax treats **`|`** as special (plural / list). To show a literal vertical bar in user-visible text, write **`\\|`** in the TypeScript string (backslash + pipe in the source so the runtime message contains **`\|`**, which compiles to a single **`|`**). The same escape style applies to **`@`**, **`{`**, **`}`**, and **`\`** where you need them literally; see Intlify message syntax docs.
- App-wide strings that do not belong to a specific component, dialog, or page go in `globalFunctionality/`. Uncategorised strings live in `globalFunctionality/L_unsortedAppTexts.ts` under the `globalFunctionality.unsortedAppTexts` key.

## index.ts rules

- `index.ts` must contain **only imports and the composed export object**. No hardcoded user-visible strings.
- Every new section maps a camelCase top-level key to its imported `L_*` locale module (or, for `documents`, to its `specialCharacterFixer(...)` call).
- Import ordering in `index.ts`: markdown document imports first, then component `L_*` imports grouped by folder (`components/`, then `dialogs/`, then `globalFunctionality/`, then `pages/`).

## Using strings in code

- **Vue templates**: `$t('camelCaseKey.subKey')` — do not import `useI18n` just to call `t(...)` when `$t` is available in the template.
- **TypeScript scripts and Pinia stores**: `import { i18n } from 'app/i18n/externalFileLoader'` then `i18n.global.t('camelCaseKey.subKey')`.
- Never hardcode user-visible prose directly in `.vue` templates, `_data/` files, or scripts; always route through an i18n key.

## Adding new strings — step by step

1. Identify the right folder (`components/<bucket>/<ComponentName>/`, `dialogs/`, `pages/`, or `globalFunctionality/`).
2. Create or open `L_<name>.ts` in that folder and add the new keys (camelCase, lowercase first letter).
3. If the file is new, import it in `index.ts` and assign it to a new camelCase top-level key.
4. Use the full dot-path in templates (`$t('topLevelKey.subKey')`) or scripts (`i18n.global.t('topLevelKey.subKey')`).
5. Mirror the structure in other active locales (`de`, etc.) when those are maintained.

## Storybook integration

- For Storybook mocks/loaders, import focused non-markdown `L_*` locale modules directly (for example `app/i18n/en-US/components/globals/GlobalWindowButtons/L_GlobalWindowButtons.ts`) instead of importing `i18n/en-US/index.ts`.
- Reason: the full locale entrypoint pulls markdown `documents/*.md`, which can break Storybook/Vite import analysis.
- If Storybook stories need document content (`documents.*`), provide explicit placeholder strings (for example lorem ipsum) in `.storybook/preview.ts` rather than importing markdown files.

## Related

- [fantasia-markdown-dialogs](../fantasia-markdown-dialogs/SKILL.md) for rendering markdown in dialogs.

## Local types extraction rule

- For Vue (`.vue`) and TypeScript (`.ts`) source files, move small file-local interfaces/type aliases into a colocated `<filename>.types.ts` file and import them back.
- For JavaScript (`.js`), TypeScript (`.ts`), Vue (`.vue`), and JSON (`.json`, `.jsonc`, `.json5`) files, enforce expanded multi-line object literals via ESLint (`object-curly-newline` + `object-property-newline`) and keep files auto-fixable with `eslint --fix`.
