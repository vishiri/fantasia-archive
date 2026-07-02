---
name: fantasia-icon-picker
description: >-
  Reusable FaIconPickerInput element and src/scripts/faIcons catalogs: merged
  MDI / Font Awesome / Material icon grid, lazy load, search, and q-icon name
  storage. Use when adding icon fields, regenerating icon catalogs, or wiring
  the picker into dialogs and forms.
---

# Fantasia Archive — FaIconPickerInput

## When to use

**`FaIconPickerInput`** for single **q-icon name** (**`mdi-account`**, **`fa-solid fa-dragon`**, **`person`**) via **`v-model`**. No one-off icon grids in feature dialogs — import **`src/components/elements/FaIconPickerInput/`**.

**First consumer:** **Project Settings → Document Templates** — optional **`icon`** (**`DialogProjectSettingsDocumentTemplatesDetailPanel.vue`**).

## Public API (SFC)

```vue
<FaIconPickerInput
  v-model="draftIcon"
  test-locator="myFeature-iconInput"
/>
```

| Prop | Role |
| --- | --- |
| **`modelValue`** | Selected q-icon name (may be empty) |
| **`testLocator`** | Root **`data-test-locator`**; trigger **`{testLocator}-trigger`**, menu **`{testLocator}-menu`** |
| **`defaultIcon`** | Preview when empty (default **`mdi-file-outline`** — **`FA_ICON_PICKER_EMPTY_PLACEHOLDER_ICON`**) |

**Emit:** **`update:modelValue`**.

**Test hooks:** **`data-test-icon-name`** on trigger when set; grid cells **`data-test-icon-name`** + **`data-test-locator="…-iconCell"`**.

**i18n:** **`faIconPickerInput.*`** from **`i18n/<locale>/components/elements/FaIconPickerInput/L_FaIconPickerInput.ts`**. Mirror keys in **`externalFileLoader.ts`**.

## UX behavior

- **Trigger:** round **`q-btn`**, two-line tooltip
- **Menu:** search (autofocus on open), merged catalog, **`QVirtualScroll`** 16-icon rows
- **Load:** all packs parallel on first open, merge + dedupe + sort A–Z, session cache
- **Search:** debounced **`FA_ICON_PICKER_SEARCH_DEBOUNCE_MS`** (150 ms)
- **Cells:** flat **`q-btn`** (not round); selected = primary icon color only

## File map

| Area | Path |
| --- | --- |
| SFC + menu | **`FaIconPickerInput.vue`**, **`FaIconPickerInputMenuPanel.vue`** |
| Composable | **`scripts/faIconPickerInput_manager.ts`**, **`faIconPickerInputComposableWiring.ts`** |
| Styles | **`styles/_variables.scss`**, **`styles/FaIconPickerInput.*.unscoped.scss`** |
| Types + layout | **`types/I_faIconPickerInput.ts`** (**`FA_ICON_PICKER_ICONS_PER_ROW`**, **`FA_ICON_PICKER_VIRTUAL_ROW_HEIGHT_PX`** sync with SCSS) |
| Level-1 catalog | **`src/scripts/faIcons/functions/`** |
| Level-2 wiring | **`faIconPickerMergedCatalogLoadWiring.ts`**, **`faIconPickerCatalogLazyLoadWiring.ts`** |
| Catalogs | **`src/scripts/faIcons/catalogs/*.catalog.json`** |
| Generator | **`.utility-scripts/generateFaQuasarIconCatalogs.mjs`** → **`yarn generate:icon-catalogs`** |
| Storybook | **`_tests/FaIconPickerInput.stories.ts`** |

## Icon packs

| Pack | Examples |
| --- | --- |
| **`mdi-v7`** | **`mdi-account`**, **`mdi-file-outline`** |
| **`fontawesome-v6`** | **`fa-solid fa-user`**, **`fa-brands fa-github`** |
| **`material-icons`** | **`person`**, **`home`** |

**`loadFaIconPickerMergedCatalogAsync`** loads **`FA_ICON_PICKER_PACK_IDS`**, then **`mergeFaIconPickerCatalogSlices`**.

## Regenerating catalogs

After **`@quasar/extras`** or **`quasar.config.ts`** icon set changes:

1. **`yarn generate:icon-catalogs`**
2. Commit **`src/scripts/faIcons/catalogs/*.catalog.json`**
3. **Full** **`yarn testbatch:verify`** before commit (catalog regen touches broad lint/coverage surface)

Prefer regenerate over hand-editing thousands of lines.

## Adding to a new screen

1. Import **`FaIconPickerInput`**
2. **`v-model`** draft string (persist q-icon name in SQLite/store)
3. Unique **`test-locator`**; extend Playwright **`selectorList`** if user-facing
4. Parent may add **`faIconPickerInput__field`** + feature BEM
5. Stub in colocated Vitest when testing parent layout only

## Two-level layout

- **Level 1:** **`src/scripts/faIcons/functions/*.ts`** — pure transforms
- **Level 2:** **`faIconPickerInput_manager.ts`** wires Vue + catalog loaders

See [fantasia-two-level-architecture](../fantasia-two-level-architecture/SKILL.md).

## Tests

| Suite | Location |
| --- | --- |
| Vitest (SFC) | **`FaIconPickerInput/_tests/FaIconPickerInput.vitest.test.ts`** |
| Vitest (composable) | **`scripts/_tests/createUseFaIconPickerInput.vitest.test.ts`** |
| Vitest (faIcons) | **`src/scripts/faIcons/_tests/`** |
| Playwright | **`DialogProjectSettings.playwright.test.ts`** |

## Related

- [fa-icon-picker.mdc](../../rules/fa-icon-picker.mdc)
- [fantasia-quasar-vue](../fantasia-quasar-vue/SKILL.md)
