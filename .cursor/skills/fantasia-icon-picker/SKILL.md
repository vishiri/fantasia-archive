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

Use **`FaIconPickerInput`** whenever the product needs a **single q-icon name** (for example **`mdi-account`**, **`fa-solid fa-dragon`**, **`person`**) bound with **`v-model`**. Do **not** build a one-off icon grid in feature dialogs — import the shared element from **`src/components/elements/FaIconPickerInput/`**.

**First consumer:** **Project Settings → Document Templates** — optional **`icon`** on each template (**`DialogProjectSettingsDocumentTemplatesDetailPanel.vue`**). Future surfaces (document browser, template editor, custom fields) should reuse the same component.

## Public API (SFC)

```vue
<FaIconPickerInput
  v-model="draftIcon"
  test-locator="myFeature-iconInput"
/>
```

| Prop | Role |
| --- | --- |
| **`modelValue`** | Selected q-icon name string (may be empty). |
| **`testLocator`** | Required root **`data-test-locator`**; trigger is **`{testLocator}-trigger`**, menu **`{testLocator}-menu`**. |
| **`defaultIcon`** | Preview when empty (default **`mdi-file-outline`** — **`FA_ICON_PICKER_EMPTY_PLACEHOLDER_ICON`**). |

**Emit:** **`update:modelValue`**.

**Test hooks:** **`data-test-icon-name`** on the round trigger when a value is set; each grid cell has **`data-test-icon-name`** and **`data-test-locator="…-iconCell"`**.

**i18n:** **`faIconPickerInput.*`** from **`i18n/<locale>/components/elements/FaIconPickerInput/L_FaIconPickerInput.ts`**. Mirror new keys in **`.storybook-workspace/.storybook/mocks/externalFileLoader.ts`**.

## UX behavior

- **Trigger:** round **`q-btn`** showing current icon (or placeholder); two-line tooltip (click hint + current icon name).
- **Menu:** **`q-menu`** with search (**autofocus on open**), single **merged** catalog (no per-pack tabs), **`QVirtualScroll`** over 16-icon rows.
- **Catalog load:** all packs load in parallel on first open, merge + dedupe + sort A–Z, session cache until page reload.
- **Search:** debounced (**`FA_ICON_PICKER_SEARCH_DEBOUNCE_MS`**, 150 ms); case-insensitive substring match on icon name.
- **Grid cells:** flat **`q-btn`** (not round) so wide Font Awesome glyphs are not circularly clipped; selected row uses primary icon color only (no fill).

## File map

| Area | Path |
| --- | --- |
| SFC + menu panel | **`src/components/elements/FaIconPickerInput/FaIconPickerInput.vue`**, **`FaIconPickerInputMenuPanel.vue`** |
| Composable wiring | **`scripts/faIconPickerInput_manager.ts`**, **`scripts/faIconPickerInputComposableWiring.ts`** |
| Styles / tokens | **`styles/_variables.scss`** (forwarded from **`src/css/quasar.variables.scss`**), **`styles/FaIconPickerInput.*.unscoped.scss`** |
| Types + layout constants | **`types/I_faIconPickerInput.ts`** (**`FA_ICON_PICKER_ICONS_PER_ROW`**, **`FA_ICON_PICKER_VIRTUAL_ROW_HEIGHT_PX`** must stay in sync with SCSS) |
| Level-1 catalog logic | **`src/scripts/faIcons/functions/`** — filter, chunk, merge, debounce, menu loader |
| Level-2 wiring | **`src/scripts/faIcons/faIconPickerMergedCatalogLoadWiring.ts`**, **`faIconPickerCatalogLazyLoadWiring.ts`** |
| Committed catalogs | **`src/scripts/faIcons/catalogs/*.catalog.json`** (**`mdi-v7`**, **`fontawesome-v6`**, **`material-icons`**) |
| Generator | **`.utility-scripts/generateFaQuasarIconCatalogs.mjs`** → **`yarn generate:icon-catalogs`** |
| Storybook | **`_tests/FaIconPickerInput.stories.ts`** — **`Components/elements/FaIconPickerInput`** |

## Icon packs

Pack ids (**`T_faIconPickerPackId`**) match **`quasar.config.ts`** **`extras`** icon sets and catalog filenames:

| Pack | q-icon examples |
| --- | --- |
| **`mdi-v7`** | **`mdi-account`**, **`mdi-file-outline`** |
| **`fontawesome-v6`** | **`fa-solid fa-user`**, **`fa-brands fa-github`** |
| **`material-icons`** | Material ligature names (**`person`**, **`home`**) |

**`loadFaIconPickerMergedCatalogAsync`** loads every **`FA_ICON_PICKER_PACK_IDS`** entry, then **`mergeFaIconPickerCatalogSlices`** dedupes and sorts.

## Regenerating catalogs

After upgrading **`@quasar/extras`** or changing which icon sets ship in **`quasar.config.ts`**:

1. Run **`yarn generate:icon-catalogs`**.
2. Commit updated **`src/scripts/faIcons/catalogs/*.catalog.json`** (and **`_data/material-icons-ligatures.source.json`** if the script refreshed it).
3. Run **`yarn testbatch:verify`** — Vitest covers merge/filter/load wiring under **`src/scripts/faIcons/_tests/`**.

Do **not** hand-edit thousands of catalog lines except for deliberate fixes; prefer regenerating.

## Adding the picker to a new screen

1. Import **`FaIconPickerInput`** from **`app/src/components/elements/FaIconPickerInput/FaIconPickerInput.vue`**.
2. Bind **`v-model`** to your draft string field (persist as q-icon name in SQLite / store).
3. Pass a unique **`test-locator`**; extend Playwright **`selectorList`** if the flow is user-facing.
4. Wrap in a field column if needed — parent may add **`faIconPickerInput__field`** plus a feature BEM class (see Document Templates detail panel).
5. Stub **`FaIconPickerInput`** in colocated Vitest when testing parent layout only.

## Two-level layout

- **Level 1:** **`src/scripts/faIcons/functions/*.ts`** — pure catalog transforms ( **`import type`** from **`app/types/**`** only).
- **Level 2:** **`faIconPickerInput_manager.ts`** wires Vue **`ref`** / **`computed`** and catalog loaders into **`createUseFaIconPickerInput`**.
- Composable factory lives in **`faIconPickerInputComposableWiring.ts`** (feature **`scripts/`**, not **`functions/`**, because it coordinates Vue lifecycle).

See [fantasia-two-level-architecture](../fantasia-two-level-architecture/SKILL.md).

## Tests

| Suite | Location |
| --- | --- |
| Vitest (SFC) | **`FaIconPickerInput/_tests/FaIconPickerInput.vitest.test.ts`** |
| Vitest (composable) | **`scripts/_tests/createUseFaIconPickerInput.vitest.test.ts`** |
| Vitest (faIcons) | **`src/scripts/faIcons/_tests/`**, **`functions/_tests/`** |
| Playwright | **`DialogProjectSettings.playwright.test.ts`** — open menu, search, pick **`mdi-account`** via **`data-test-icon-name`** |

Mock **`loadFaIconPickerMergedCatalogAsync`** in SFC Vitest; use real catalogs in **`faIcons`** unit tests.

## Related

- [fa-icon-picker.mdc](../../rules/fa-icon-picker.mdc) — policy when touching picker or catalogs
- [AGENTS.md](../../../AGENTS.md) **FaIconPickerInput (reusable icon field)**
- [typescript-scripts.mdc](../../rules/typescript-scripts.mdc) **`faIcons/`**
- [fantasia-quasar-vue](../fantasia-quasar-vue/SKILL.md) **`elements/`** bucket
