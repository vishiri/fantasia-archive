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
- Dialog flow is tied to Pinia dialog state (`src/stores/S_Dialog.ts`) and helpers in **`src/scripts/appGlobalManagementUI/dialogManagement.ts`** (for example **`openDialogMarkdownDocument`**). The root `q-dialog` model calls **`registerMarkdownDialogStackGuard`** from that module so **`markdownDialogOpenCount`** stays aligned when the dialog closes or the host unmounts.
- **Triggering opens**: User-initiated markdown dialog opens (Changelog, License, Advanced Search Guide, Tips Tricks Trivia) go through the **action manager** registry (**`openChangelogDialog`**, **`openLicenseDialog`**, **`openAdvancedSearchGuideDialog`**, **`openTipsTricksTriviaDialog`**) via **`runFaAction`** so failures funnel into the unified single-toast surface. See [fantasia-action-manager](../fantasia-action-manager/SKILL.md).

## Content source

- Long-form markdown files live under `i18n/en-US/documents/` (and parallel locales) and are registered on the `documents` key in `i18n/en-US/index.ts` (often through `specialCharacterFixer`).
- Storybook-specific runs should not import those markdown files through full locale entrypoints by default; provide placeholder `documents.*` strings in [`.storybook-workspace/.storybook/preview.ts`](../../../.storybook-workspace/.storybook/preview.ts) unless Storybook markdown loader support is explicitly configured.

## Conventions

- Prefer updating `.md` assets and i18n wiring over hardcoding large markdown in `.vue` files.
- Keep headings and structure readable in a modal/dialog viewport; test in the actual dialog component.
- Markdown under **`i18n/*/documents/`** is compiled as **vue-i18n** message text: **do not** use stray **`{...}`** (for example glob **`.*.{ext1,ext2}`**) unless you follow vue-i18n placeholder rules — invalid groups break the changelog and other document dialogs at runtime. See [fantasia-changelog-en-us](../fantasia-changelog-en-us/SKILL.md) for changelog-specific wording.

## Related

- [fantasia-i18n](../fantasia-i18n/SKILL.md) for locale layout and `documents` registration.
- [fantasia-action-manager](../fantasia-action-manager/SKILL.md) for the dispatcher that opens these dialogs from menus, keybinds, and other call sites.

## TypeScript interfaces and types (`types/`)

- Put shared `interface` / `type` declarations in repository-root `types/` (import with `app/types/...`). Prefer one domain-oriented module per feature area with brief JSDoc on exports (see `types/I_appMenusDataList.ts`). Do not add colocated `<filename>.types.ts` under `src/`, `src-electron/`, or `.storybook-workspace/`. Ambient augmentations for third-party modules also live under `types/` and are loaded with a side-effect import from the owning boot file or `src/stores/index.ts` (see `types/piniaModuleAugmentation.ts`).
- For JavaScript (`.js`), TypeScript (`.ts`), Vue (`.vue`), and JSON (`.json`, `.jsonc`, `.json5`) files, enforce expanded multi-line object literals via ESLint (`object-curly-newline` + `object-property-newline`) and keep files auto-fixable with `eslint --fix`.
