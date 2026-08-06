---
name: fantasia-select-input
description: >-
  Reusable FaSelectInput QSelect chips wrapper and src/scripts/faSelectInput helpers:
  modes simple / document / otherType / tags (media stub), filter highlight, create-new,
  clearIsNewFlags. Use when adding select/chip fields or wiring document/template options.
---

# Fantasia Archive — FaSelectInput

## When to use

Reusable **`q-select`** with chips, filter input, whole-word label highlight, optional create-new → **`FaSelectInput`** from **`src/components/elements/FaSelectInput/`**. **No** one-off chip menus that reimplement this contract.

**Do not** use **`mode="media"`** yet — typed stub; options always normalize to **`[]`**.

**Live smoke only** (not persisted document field): **`DocumentWorkspacePageSelectSmoke`** under dead toggle on **`DocumentWorkspacePage`**.

App Settings enum **`q-select`** stays in **`DialogAppSettingsSettingBlock`** unless product wants this chip UX.

## Public API (SFC)

```vue
<FaSelectInput
  v-model="model"
  mode="document"
  :options="options"
  test-locator="myFeature-select"
  allow-create-new
  @request-options="reloadOptions"
  @new-value="onCreated"
  @change="onChange"
/>
```

| Prop | Role |
| --- | --- |
| **`mode`** | Required — **`simple`** \| **`document`** \| **`otherType`** \| **`tags`** \| **`media`** (stub) |
| **`modelValue`** | String(s) or object item(s) / **`null`** per mode |
| **`options`** | Strings or **`I_faSelectInputObjectItem`** list |
| **`testLocator`** | Root **`data-test-locator`**; chip / option / separatorAlt suffixes |
| **`allowCreateNew`** | Opt-in Enter create-new (default **`false`**) |
| **`clearInputOnSelect`** | Opt-in clear filter text after select/create (default **`false`**; chip stays) |
| **`filterFn`** | Optional override of default filter |
| **`multiple`**, **`label`**, **`loading`**, **`disable`**, Quasar chrome | Standard defaults: dense filled dark, color **`primary-bright`** |

**Emits:** **`update:modelValue`**, **`change`** (`{ action, value }`), **`new-value`**, **`request-options`** (focus + popup-show).

**Expose:** **`clearIsNewFlags(ids)`** — strip **`isNew`** after save.

**Test hooks:** **`{testLocator}`**, **`-chip`**, **`-option-{index}`**, **`-separatorAlt-{index}`** (index ≥ 1).

## UX behavior

- Chips always; hide empty single selection; **`isNew`** → teal-3 chip else accent; text dark
- Object **`icon`** on chip/option when non-empty
- Filter highlight = whole whitespace-delimited words matching needle words (not letter-only wash)
- Menu fixed **600px**, center under field (**`bottom middle`** / **`top middle`**)
- **separatorAlt** between options; selected row = side bars only
- Create-new: trim; simple string or object **`{ id: crypto.randomUUID(), name, isNew: true }`**

## File map

| Area | Path |
| --- | --- |
| SFC + styles | **`FaSelectInput.vue`**, **`styles/_variables.scss`**, **`styles/FaSelectInput.unscoped.scss`** |
| Composable | **`scripts/faSelectInput_manager.ts`**, **`scripts/functions/createUseFaSelectInput.ts`** |
| Domain | **`src/scripts/faSelectInput/functions/`** + **`faSelectInput_manager.ts`** barrel |
| Types | **`types/I_faSelectInput.ts`** |
| Storybook | **`_tests/FaSelectInput.stories.ts`** |
| Smoke | **`DocumentWorkspacePageSelectSmoke.vue`** + **`mapDocumentWorkspacePageSelectSmokeOptions.ts`** |

## Modes

| Mode | Options | Empty single |
| --- | --- | --- |
| **`simple`** | strings | **`''`** |
| **`document`** / **`otherType`** / **`tags`** | objects | **`null`** |
| **`media`** | always **`[]`** | stub |

Smoke today: simple + **`otherType`** templates + **`document`** docs via projectContent IPC on **`request-options`**.

## Adding to a new screen

1. Import **`FaSelectInput`**; pick **`mode`**
2. Parent owns **`options`** + reload on **`@request-options`**
3. Unique **`test-locator`**
4. Persist create-new: listen **`@new-value`** / **`@change`**; call **`clearIsNewFlags`** when ids saved
5. Stub in parent Vitest when testing layout only

## Two-level layout

- Level 1: **`src/scripts/faSelectInput/functions/*.ts`** + element **`createUseFaSelectInput`**
- Level 2: element **`faSelectInput_manager.ts`** wires Vue + domain barrel

See [fantasia-two-level-architecture](../fantasia-two-level-architecture/SKILL.md).

## Tests

| Suite | Location |
| --- | --- |
| Vitest (SFC) | **`FaSelectInput/_tests/FaSelectInput.vitest.test.ts`** |
| Vitest (composable) | **`scripts/_tests/createUseFaSelectInput.vitest.test.ts`** |
| Vitest (domain) | **`src/scripts/faSelectInput/functions/_tests/faSelectInputDomain.vitest.test.ts`** |
| Smoke | **`DocumentWorkspacePageSelectSmoke.vitest.test.ts`** |

No Playwright specs yet.

## Related

- [fa-select-input.mdc](../../rules/fa-select-input.mdc)
- [fa-context-menu-dividers.mdc](../../rules/fa-context-menu-dividers.mdc)
- [fantasia-quasar-vue](../fantasia-quasar-vue/SKILL.md)
