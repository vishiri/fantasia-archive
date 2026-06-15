---
name: fantasia-drag-drop
description: >-
  List and table drag-and-drop policy for Fantasia Archive: vue-draggable-plus
  for QList and flat lists; quasar-ui-q-draggable-table (v-draggable-table) for
  QTable row reorder; @he-tree/vue Draggable for trees. Use when adding reorder
  UX to settings lists, worlds, tables, or documenting DnD dependencies.
---

# Fantasia Archive — drag-and-drop (lists and tables)

## Policy summary

| Surface | Library | Notes |
| --- | --- | --- |
| **Flat lists** (`QList`, `QItem`, vertical rows) | **`vue-draggable-plus`** | Default for any list reorder |
| **`QTable` row reorder** | **`quasar-ui-q-draggable-table`** | **`v-draggable-table`**, boot **`q-draggable-table`** |
| **Hierarchical trees** | **`@he-tree/vue`** **`Draggable`** | Built-in DnD — **do not** use vue-draggable-plus on trees |
| **Floating / spatial move** | Custom pointer sessions | **`src/scripts/floatingWindows/`** — not this skill |

Dependencies are in root **`package.json`**: **`vue-draggable-plus`**, **`quasar-ui-q-draggable-table`**.

## `vue-draggable-plus` (default lists)

Docs: [vue-draggable-plus.pages.dev](https://vue-draggable-plus.pages.dev/en/).

### Component example (`QList` body)

```vue
<script setup lang="ts">
import { ref } from 'vue'
import { VueDraggable } from 'vue-draggable-plus'

const worlds = ref([
  { id: 'a', displayName: 'Realm' },
  { id: 'b', displayName: 'Other' }
])

function onWorldReorder (): void {
  // Persist sort_order from worlds.value order — IPC / store
}
</script>

<template>
  <q-list data-test-locator="worldsReorderList">
    <VueDraggable
      v-model="worlds"
      :animation="150"
      handle=".world-drag-handle"
      @update="onWorldReorder"
    >
      <q-item
        v-for="world in worlds"
        :key="world.id"
        data-test-locator="worldsReorderRow"
      >
        <q-item-section avatar>
          <q-icon
            class="world-drag-handle cursor-grab"
            name="mdi-drag"
            data-test-locator="worldsReorderHandle"
          />
        </q-item-section>
        <q-item-section>{{ world.displayName }}</q-item-section>
      </q-item>
    </VueDraggable>
  </q-list>
</template>
```

### Composable / target container

When the sortable root is not the component root, use **`useDraggable(el, list, options)`** or **`v-draggable`** with a selector — see upstream **target container** docs.

### Persistence

- Reorder updates the in-memory array first; on **`@update`** / **`onEnd`**, write domain order (for example **`sort_order`**) through **`runFaActionAwait`** or store methods that call **`projectContent`** IPC.
- Keep drag wiring in feature **`scripts/`**; thin **`.vue`** imports the composable or **`VueDraggable`** only.

### Vertical tab strips (**`DialogProjectSettings`** worlds list)

When reordering **vertical category tabs** (world names in **Project Settings**), reuse **`src/scripts/faDragDrop/`** helpers (**`faVerticalDraggableTabsSortableDragOptions`**, **`faVerticalDraggableTabsDocumentDragCursor`**, **`hideNativeSortableDragGhost`**) and global SCSS **`src/css/theme/custom-components/faVerticalDraggableTabs.scss`**. **`DialogProjectSettingsWorldsTabList`** uses **`vue-draggable-plus`** with a movement threshold so short clicks select a tab without starting a drag. Palette swatch reorder inside a world uses the same library in **`DialogProjectSettingsWorldColorPaletteEditor`**.

#### Vertical draggable tab strips (reusable column)

Shared pattern for a **left column** of draggable tabs plus an optional **Add** row (master–detail settings dialogs). Not a Quasar **`QTabs`** replacement for horizontal category tabs — only the **vertical reorderable list** chrome.

**Reference implementations**

| SFC | Role |
| --- | --- |
| **`DialogProjectSettingsWorldsTabList.vue`** | Worlds column; default width **240px** |
| **`DialogProjectSettingsDocumentTemplatesTabList.vue`** | Document templates column; panel passes **`tab-list-width-px="360"`** |
| **`DialogProjectSettingsWorldsTabItem.vue`** / **`DialogProjectSettingsDocumentTemplatesTabItem.vue`** | Single tab row (`faVerticalDraggableTabs__tab` BEM) |

**DOM skeleton** (outer host must include class **`faVerticalDraggableTabs`**):

```text
.faVerticalDraggableTabs                    ← :style from buildFaVerticalDraggableTabsRootStyle
  .faVerticalDraggableTabs__scroll.hasScrollbar
    VueDraggable.faVerticalDraggableTabs__draggable
      *TabItem × N                           ← role=button, class faVerticalDraggableTabs__tab
    .faVerticalDraggableTabs__divider        ← q-separator
    .faVerticalDraggableTabs__addButtonRow
      q-btn.faVerticalDraggableTabs__addButton
```

Import global styles once per feature via **`@use`** / **`src=`** on a colocated unscoped SCSS file if the host needs a fixed column width class (see **`DialogProjectSettings.worldsTabList.unscoped.scss`**). Base tokens: **`src/css/theme/custom-components/_faVerticalDraggableTabs.variables.scss`**.

**Layout props** (on the TabList host SFC; all optional with defaults):

| Prop | Default | Maps to CSS variable |
| --- | --- | --- |
| **`tabListWidthPx`** | **`240`** | **`--fa-vertical-draggable-tabs-column-width`** |
| **`tabPadding`** | **`'4px 40px 4px 60px'`** | **`--fa-vertical-draggable-tabs-tab-padding`** |
| **`tabTextAlign`** | **`'left'`** | **`--fa-vertical-draggable-tabs-tab-text-align`** |
| **`tabJustifyContent`** | **`'flex-start'`** | **`--fa-vertical-draggable-tabs-tab-justify-content`** |
| **`tabLabelTextTransform`** | **`'none'`** | **`--fa-vertical-draggable-tabs-tab-label-text-transform`** |
| **`tabLabelFontSize`** | **`'14px'`** | **`--fa-vertical-draggable-tabs-tab-label-font-size`** |
| **`dense`** | **`false`** (document templates TabList default **`true`**) | **`--fa-vertical-draggable-tabs-tab-min-height`** (**`36px`** when dense; SCSS fallback **`48px`**) |

Types: **`types/I_faVerticalDraggableTabs.ts`**. Defaults and **`buildFaVerticalDraggableTabsRootStyle`**: **`src/scripts/faDragDrop/functions/buildFaVerticalDraggableTabsRootStyle.ts`**.

**TabList script pattern**

```ts
import {
  FA_VERTICAL_DRAGGABLE_TABS_TAB_JUSTIFY_CONTENT_DEFAULT,
  FA_VERTICAL_DRAGGABLE_TABS_TAB_LABEL_FONT_SIZE_DEFAULT,
  FA_VERTICAL_DRAGGABLE_TABS_TAB_LABEL_TEXT_TRANSFORM_DEFAULT,
  FA_VERTICAL_DRAGGABLE_TABS_TAB_PADDING_DEFAULT,
  FA_VERTICAL_DRAGGABLE_TABS_TAB_TEXT_ALIGN_DEFAULT,
  buildFaVerticalDraggableTabsRootStyle
} from 'app/src/scripts/faDragDrop/functions/buildFaVerticalDraggableTabsRootStyle'

const tabListRootStyle = computed(() => buildFaVerticalDraggableTabsRootStyle({
  columnWidthPx: props.tabListWidthPx,
  tabDense: props.dense,
  tabJustifyContent: props.tabJustifyContent,
  tabLabelFontSize: props.tabLabelFontSize,
  tabLabelTextTransform: props.tabLabelTextTransform,
  tabPadding: props.tabPadding,
  tabTextAlign: props.tabTextAlign
}))
```

**Drag wiring** (same on both reference TabLists):

- **`faVerticalDraggableTabsSortableDragOptions`** on **`VueDraggable`**
- **`touch-start-threshold="5"`** so tap-to-select does not start drag
- **`@start`** → **`applyFaVerticalDraggableTabsDocumentDragCursor`**
- **`@end`** → **`clearFaVerticalDraggableTabsDocumentDragCursor`** + emit reordered array
- Root **`computed`** class **`faVerticalDraggableTabs--listDragging`** while dragging
- Tab item modifiers: **`--active`**, **`--dragging`**, **`--error`**

**Tests**: **`src/scripts/faDragDrop/_tests/buildFaVerticalDraggableTabsRootStyle.vitest.test.ts`**; TabList Vitest stubs **`VueDraggable`**; Playwright uses **`data-test-locator`** on list, tabs, and add button.

## `quasar-ui-q-draggable-table` (`QTable` rows)

Registered globally via **`src/boot/q-draggable-table.ts`** (listed in **`quasar.config.ts`** **`boot`**).

```vue
<q-table
  v-draggable-table="{
    options: { mode: 'row' },
    onDrop
  }"
  :rows="rows"
  :columns="columns"
  row-key="id"
/>
```

```ts
function onDrop (from: number, to: number): void {
  const next = [...rows.value]
  next.splice(to, 0, next.splice(from, 1)[0])
  rows.value = next
  // Persist row order
}
```

- Import **`quasar-ui-q-draggable-table/dist/index.css`** is loaded from the boot manager (do not duplicate per SFC).
- Avoid **`virtual-scroll`** on the same **`QTable`** when using row drag.
- Upstream: [github.com/bd2051/q-draggable-table](https://github.com/bd2051/q-draggable-table)

## Trees — use he-tree, not vue-draggable-plus

For nested hierarchies, follow [fantasia-he-tree](../fantasia-he-tree/SKILL.md): **`Draggable`** from **`@he-tree/vue`** owns reorder semantics.

## Tests

- **Vitest**: mock **`vue-draggable-plus`** when mount-only smoke tests do not need real drag; test reorder helpers in **`scripts/_tests`** with pure array moves.
- **Playwright**: use **`data-test-locator`** on handles; drag with pointer APIs per [playwright-tests.mdc](../../rules/playwright-tests.mdc).

## Related

- [fa-drag-drop-lists.mdc](../../rules/fa-drag-drop-lists.mdc)
- [fa-he-tree.mdc](../../rules/fa-he-tree.mdc)
- [fantasia-floating-windows](../fantasia-floating-windows/SKILL.md) for spatial window drag
