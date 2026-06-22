---
name: fantasia-locale-translations-input
description: >-
  FaLocaleTranslationsInput element and per-locale string maps for Project Settings
  world names, document template titles, world appendix, layout group names, and
  placement nicknames. Use when wiring translation fields, snapshot JSON columns,
  or migrating display strings to translation maps.
---

# Fantasia Archive — FaLocaleTranslationsInput (Project Settings)

## When to use

Per-locale **single-line** (or multiline) string on a draft/snapshot → **`FaLocaleTranslationsInput`** from **`src/components/elements/FaLocaleTranslationsInput/`**. **No** duplicate translate menus in feature folders.

**Project Settings consumers today:**

| UI field | Draft / snapshot property | SQL |
| --- | --- | --- |
| **World name** | **`displayNameTranslations`** | **`worlds.display_name_translations_json`** (**v9**) |
| **Document template name** | **`titleTranslations`** | **`document_templates.title_translations_json`** (**v8**) |
| **World appendix** | **`worldAppendixTranslations`** | **`document_templates.world_appendix_translations_json`** (**v9**) |
| **Layout group name** | **`displayNameTranslations`** | **`world_template_groups.display_name_translations_json`** (**v10**) |
| **Placement nickname** | **`nicknameTranslations`** | **`world_template_placements.nickname_translations_json`** (**v10**) |

Placement **`worldAppendix: string`** stays resolved copy at place time (not a translation map). CRUD **`createWorld` / `updateWorld`** still take **`displayName: string`** at IPC boundary.

**Pinned-aside menu:** placement nickname rename passes **`menuPinnedAside*`** props so canonical template title stays visible while editing locale nicknames.

## Stored value contract

- Model: **`Partial<Record<T_faUserSettingsLanguageCode, string>>`** — **`types/I_faLocaleStringTranslations.ts`**
- Readonly main field = resolved text for active UI language (preferred → **en-US** → sorted locales)
- Blank trimmed locales omitted on save
- Domain max length via **`max-length`** + normalize helpers at persist

| Domain | Normalize / resolve wiring |
| --- | --- |
| Generic | **`src/scripts/localeTranslations/faLocaleStringTranslations_manager.ts`** |
| Template title | **`src/scripts/documentTemplates/faProjectDocumentTemplateTitle_manager.ts`** |
| World display name | **`faProjectWorldDisplayName_manager.ts`**, **`dialogProjectSettingsWorldsDisplayNameDraft.ts`** |
| World appendix | **`faProjectDocumentTemplateWorldAppendix_manager.ts`** |
| Layout group display name | **`faProjectWorldTemplateGroupDisplayName_manager.ts`** |
| Placement nickname | **`faProjectWorldTemplatePlacementNickname_manager.ts`** |

## Project Settings wiring patterns

**New world row:** **`appendDialogProjectSettingsWorldDraft(worlds, languageCode, defaultDisplayName)`** seeds **`displayNameTranslations`**.

**New layout group:** **`appendDialogProjectSettingsWorldTemplateGroupDraft(layout, languageCode, defaultDisplayName)`** seeds group **`displayNameTranslations`**.

**Handlers:** **`updateWorldDisplayNameTranslations`**, **`updateDocumentTemplateWorldAppendixTranslations`**, tree **`renameGroup` / `renamePlacementNickname`** with translation maps.

**Validation:** at least one non-empty locale for world names, template titles, layout group names.

**Snapshots (save):** worlds **`displayNameTranslations`**; templates **`titleTranslations`** + **`worldAppendixTranslations`**; layout groups/placements **`displayNameTranslations`** / **`nicknameTranslations`** with denormalized **`display_name`** / **`nickname`** caches.

## Element API (short)

Same as [fa-locale-translations-input.mdc](../../rules/fa-locale-translations-input.mdc): **`v-model`**, **`current-language-code`**, **`test-locator`**, **`inputMode`**, optional **`menuPinnedAside*`**, **`#after`** fallback warning.

## i18n + Storybook

- Element chrome: **`i18n/*/components/elements/FaLocaleTranslationsInput/`**
- Field labels: feature i18n
- Storybook: **`PinnedAsideMenu`** story + panel stubs; **`externalFileLoader.ts`** for copy

## Tests

- Element + **`src/scripts/localeTranslations/functions/_tests/`**
- Layout tree rename menu + migration **v9→v10**

## Related

- [fa-locale-translations-input.mdc](../../rules/fa-locale-translations-input.mdc)
- [fantasia-i18n](../fantasia-i18n/SKILL.md)
- [projectDB.md](../../../docs/database/projectDB.md) — schema **v9**–**v11**
