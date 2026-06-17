---
name: fantasia-i18n
description: >-
  Manages vue-i18n messages and locale structure for Fantasia Archive. Use when
  adding or changing user-facing strings, locale files under repo-root i18n/, or
  markdown-backed documents wired into i18n.
---

# Fantasia Archive — i18n

## Setup

- **Plugin**: `vue-i18n` v9
- **Registry**: **`i18n/index.ts`** at repo root — import **`app/i18n`**
- **Types**: augmentation in **`src/boot/i18n.ts`**; may need **`@ts-expect-error`** (TS2665) — [eslint-typescript.mdc](../../rules/eslint-typescript.mdc)

## Folder structure (`i18n/en-US/`)

```
i18n/
  index.ts
  externalFileLoader.ts
  specialCharactersFixer.ts
  _tests/
  en-US/
    index.ts
    documents/                          — .md via ?raw + specialCharacterFixer
    components/<bucket>/<ComponentName>/
    dialogs/
    floatingWindows/
    pages/
    globalFunctionality/
```

No locale files elsewhere. Unmatched → **`globalFunctionality/`**.

**Naming**: locale files **`L_` prefix**; types elsewhere use **`T_`**.

## Key naming rules

- Top-level keys from **`index.ts`**: camelCase, lowercase first (**`globalWindowButtons`**, **`dialogs`**, …)
- Sub-keys in **`L_*.ts`**: same
- **`index.ts`**: imports + composed export only — no hardcoded user strings
- **`documents`**: processed markdown only; **`specialCharacterFixer`**. Avoid literal **`{...}`** in Markdown — [fantasia-changelog-en-us](../fantasia-changelog-en-us/SKILL.md). No CSS rule blocks with brace delimiters — [fantasia-markdown-dialogs](../fantasia-markdown-dialogs/SKILL.md)
- Literal **`|`** in user text: **`\\|`** in TS source (Intlify escape)
- App-wide uncategorized: **`globalFunctionality/L_unsortedAppTexts.ts`**

## English (`en-US`) capitalization

- **Sentence-style**: running prose, tooltips, changelog sentence refs — [en-us-ui-copy-capitalization.mdc](../../rules/en-us-ui-copy-capitalization.mdc)
- **Headline-style**: menu rows, keybind commands, dialog/floating-window titles
- **`appControlMenus`** top four **`title`** strings: menu-bar title casing
- Other locales: mirror semantic roles, not English caps

## index.ts rules

- Imports + export object only
- Import order: markdown documents → **`components/`** → **`dialogs/`** → **`floatingWindows/`** → **`globalFunctionality/`** → **`pages/`**

## Using strings in code

- **Vue templates**: **`$t('camelCaseKey.subKey')`**
- **TS / Pinia**: **`import { i18n } from 'app/i18n/externalFileLoader'`** → **`i18n.global.t(...)`**
- No hardcoded user prose in **`.vue`**, **`_data/`**, scripts

## Tests tied to copy changes

Key changes affecting **`toHaveText`**, **`aria-label`**, **`L_*`** in Playwright → grep + run matching Vitest/Playwright; rebuild Electron when bundle matters — [fantasia-testing](../fantasia-testing/SKILL.md).

## Adding new strings

1. Pick folder (`components/`, `dialogs/`, `pages/`, `globalFunctionality/`)
2. Create/edit **`L_<name>.ts`**
3. Import in **`index.ts`** → new camelCase top-level key
4. Use full dot-path in **`$t`** / **`i18n.global.t`**
5. Mirror in other locales when maintained

## Storybook integration

- Import focused **`L_*`** modules — not **`i18n/en-US/index.ts`** (pulls markdown)
- Placeholder **`documents.*`** in **`externalFileLoader.ts`**
- **Mandatory**: new **`L_*`** in **`i18n/en-US/index.ts`** used by stories → same PR adds import + key to **`defaultMessages`**

## Related

- [en-us-ui-copy-capitalization.mdc](../../rules/en-us-ui-copy-capitalization.mdc)
- [fantasia-testing](../fantasia-testing/SKILL.md)
- [fantasia-markdown-dialogs](../fantasia-markdown-dialogs/SKILL.md)

## Types

Shared types → **`types/`**. See [types-folder.mdc](../../rules/types-folder.mdc).
