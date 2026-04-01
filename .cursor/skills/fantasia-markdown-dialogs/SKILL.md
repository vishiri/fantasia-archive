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

- Long-form markdown files live under `src/i18n/en-US/documents/` (and parallel locales) and are registered on the `documents` key in `src/i18n/en-US/index.ts` (often through `specialCharacterFixer`).
- Storybook-specific runs should not import those markdown files through full locale entrypoints by default; provide placeholder `documents.*` strings in `.storybook/preview.ts` unless Storybook markdown loader support is explicitly configured.

## Conventions

- Prefer updating `.md` assets and i18n wiring over hardcoding large markdown in `.vue` files.
- Keep headings and structure readable in a modal/dialog viewport; test in the actual dialog component.

## Related

- [fantasia-i18n](../fantasia-i18n/SKILL.md) for locale layout and `documents` registration.
