---
name: fantasia-markdown-dialogs
description: >-
  Implements or edits markdown-backed dialogs using Quasar QMarkdown and i18n-
  sourced document strings. Use when changing DialogMarkdownDocument, help
  docs, or changelog/license content shown in-app.
---

# Fantasia Archive — markdown dialogs

## Components

- **`DialogMarkdownDocument.vue`**: **`QMarkdown`** + package CSS
- Flow: **`S_Dialog.ts`**, **`dialogManagement.ts`** — **`openDialogMarkdownDocument`**, **`registerMarkdownDialogStackGuard`**
- User opens (Changelog, License, guides, Tips): action manager ids (**`openChangelogDialog`**, …) via **`runFaAction`** — [fantasia-action-manager](../fantasia-action-manager/SKILL.md)

## Content source

- Markdown: **`i18n/en-US/documents/`** (+ locales); registered on **`documents`** key via **`specialCharacterFixer`**
- Storybook: placeholder **`documents.*`** in preview/mocks — not full locale entrypoints

## Conventions

- Update **`.md`** + i18n wiring — not large markdown in **`.vue`**
- Readable headings in modal viewport; test in dialog
- **`i18n/*/documents/`** = vue-i18n messages: **no stray `{...}`** or CSS brace blocks — [fantasia-changelog-en-us](../fantasia-changelog-en-us/SKILL.md)

## Related

- [fantasia-i18n](../fantasia-i18n/SKILL.md)
- [fantasia-action-manager](../fantasia-action-manager/SKILL.md)
- Inline code chip: **`<code class="code-token">`** — [project-scss.mdc](../../rules/project-scss.mdc)

## Types

Shared types → **`types/`**. See [types-folder.mdc](../../rules/types-folder.mdc).
