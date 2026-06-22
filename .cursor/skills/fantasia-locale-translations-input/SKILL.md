---
name: fantasia-locale-translations-input
description: >-
  FaLocaleTranslationsInput element and per-locale string maps for Project Settings
  world names, document template titles, and world appendix copy. Use when wiring
  translation fields, snapshot JSON columns, or migrating displayName/worldAppendix
  strings to translation maps.
---

# Fantasia Archive — FaLocaleTranslationsInput (Project Settings)

## When to use

Per-locale **single-line** (or multiline) string on a draft/snapshot → **`FaLocaleTranslationsInput`** from **`src/components/elements/FaLocaleTranslationsInput/`**. **No** duplicate translate menus in feature folders.

**Project Settings consumers today:**

| UI field | Draft / snapshot property | SQL (schema **v9**) |
| --- | --- | --- |
| **World name** | **`displayNameTranslations`** | **`worlds.display_name_translations_json`** |
| **Document template name** | **`titleTranslations`** | **`document_templates.title_translations_json`** |
| **World appendix** | **`worldAppendixTranslations`** | **`document_templates.world_appendix_translations_json`** |

**Not** translation maps: template layout **group** labels (**`displayName: string`**), placement **`worldAppendix: string`** (resolved copy at place time), CRUD **`createWorld` / `updateWorld`** still take **`displayName: string`** at IPC boundary.

## Stored value contract

- Model: **`Partial<Record<T_faUserSettingsLanguageCode, string>>`** — **`types/I_faLocaleStringTranslations.ts`**
- Readonly main field = resolved text for active UI language (preferred → **en-US** → sorted locales)
- Blank trimmed locales omitted on save
- Domain max length via **`max-length`** + normalize helpers at persist

| Domain | Normalize / resolve wiring |
| --- | --- |
| Generic | **`src/scripts/localeTranslations/faLocaleStringTranslations_manager.ts`** |
| Template title | **`src/scripts/documentTemplates/faProjectDocumentTemplateTitle_manager.ts`** |
| World display name | **`src/scripts/projectWorlds/faProjectWorldDisplayName_manager.ts`**, dialog **`dialogProjectSettingsWorldsDisplayNameDraft.ts`** |
| World appendix | **`src/scripts/documentTemplates/faProjectDocumentTemplateWorldAppendix_manager.ts`** |

## Project Settings wiring patterns

**New world row:** **`appendDialogProjectSettingsWorldDraft(worlds, languageCode, defaultDisplayName)`** seeds **`displayNameTranslations`** with one locale key.

**Handlers (dialog):**

- **`updateWorldDisplayNameTranslations(id, displayNameTranslations)`**
- **`updateDocumentTemplateWorldAppendixTranslations(id, worldAppendixTranslations)`**

**Validation:** **`isDialogProjectSettingsWorldNameInvalid(translations)`**; save tooltip **`resolveDialogProjectSettingsWorldSaveErrorDisplayName(translations, languageCode, defaultName)`**.

**Filters:** **`filterDialogProjectSettingsWorldsByQuery(worlds, query, languageCode)`**; template filter resolves appendix via **`resolveDialogProjectSettingsDocumentTemplateResolvedWorldAppendix`**.

**Snapshots (save):** worlds items **`displayNameTranslations`**; template items **`titleTranslations`** + optional **`worldAppendixTranslations`**.

## Element API (short)

Same as [fa-locale-translations-input.mdc](../../rules/fa-locale-translations-input.mdc): **`v-model`**, **`current-language-code`**, **`test-locator`**, **`inputMode`**, **`#after`** fallback warning.

## i18n + Storybook

- Element chrome: **`i18n/*/components/elements/FaLocaleTranslationsInput/`**
- Field labels: feature i18n (**`dialogs.projectSettings.fields.worldName`**, **`documentTemplateWorldAppendix`**, etc.)
- Storybook: stub **`FaLocaleTranslationsInput`** in panel tests; mirror **`L_*`** in **`externalFileLoader.ts`**

## Tests

- Element + **`src/scripts/localeTranslations/functions/_tests/`**
- Feature panels: stub component; assert **`update:displayNameTranslations`** / **`update:worldAppendixTranslations`** emits
- Placement/layout tests: **`worldAppendix: string`** on drafts, not **`worldAppendixTranslations`**

## Related

- [fa-locale-translations-input.mdc](../../rules/fa-locale-translations-input.mdc)
- [fantasia-i18n](../fantasia-i18n/SKILL.md)
- [projectDB.md](../../../docs/database/projectDB.md) — schema **v9**
