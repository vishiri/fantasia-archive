---
name: fantasia-markdown-dialogs
description: >-
  Implements or edits markdown-backed dialogs using Quasar QMarkdown and i18n-
  sourced document strings. Use when changing DialogMarkdownDocument, help
  docs, or changelog/license content shown in-app.
---

# Fantasia Archive — markdown dialogs

## Components

- **`DialogMarkdownDocument.vue`**: Renders markdown via `QMarkdown` from `@quasar/quasar-ui-qmarkdown` with the package CSS imported alongside the component.
- Dialog flow is tied to Pinia dialog state (`src/stores/S_Dialog.ts`) and helpers such as `src/scripts/appInfo/openDialogMarkdownDocument.ts`.

## Content source

- Long-form markdown files live under `i18n/en-US/documents/` (and parallel locales) and are registered on the `documents` key in `i18n/en-US/index.ts` (often through `specialCharacterFixer`).
- Storybook-specific runs should not import those markdown files through full locale entrypoints by default; provide placeholder `documents.*` strings in [`.storybook-workspace/.storybook/preview.ts`](../../../.storybook-workspace/.storybook/preview.ts) unless Storybook markdown loader support is explicitly configured.

## Conventions

- Prefer updating `.md` assets and i18n wiring over hardcoding large markdown in `.vue` files.
- Keep headings and structure readable in a modal/dialog viewport; test in the actual dialog component.
- Markdown under **`i18n/*/documents/`** is compiled as **vue-i18n** message text: **do not** use stray **`{...}`** (for example glob **`.*.{ext1,ext2}`**) unless you follow vue-i18n placeholder rules — invalid groups break the changelog and other document dialogs at runtime. See [fantasia-changelog-en-us](../fantasia-changelog-en-us/SKILL.md) for changelog-specific wording.

## Related

- [fantasia-i18n](../fantasia-i18n/SKILL.md) for locale layout and `documents` registration.

## Local types extraction rule

- For Vue (`.vue`) and TypeScript (`.ts`) source files, move small file-local interfaces/type aliases into a colocated `<filename>.types.ts` file and import them back.
- For JavaScript (`.js`), TypeScript (`.ts`), Vue (`.vue`), and JSON (`.json`, `.jsonc`, `.json5`) files, enforce expanded multi-line object literals via ESLint (`object-curly-newline` + `object-property-newline`) and keep files auto-fixable with `eslint --fix`.
