---
name: fantasia-drag-drop
description: >-
  List and table drag-and-drop policy for Fantasia Archive: vue-draggable-plus
  for QList and flat lists; quasar-ui-q-draggable-table (v-draggable-table) for
  QTable row reorder; @he-tree/vue Draggable for trees. Use when adding reorder
  UX to settings lists, worlds, tables, or documenting DnD dependencies.
---

# Fantasia Archive — drag-and-drop (lists and tables)

Full policy: [fa-drag-drop-lists.mdc](../../rules/fa-drag-drop-lists.mdc).

## Policy summary

| Surface | Library | Notes |
| --- | --- | --- |
| **Flat lists** (`QList`, `QItem`, vertical rows) | **`vue-draggable-plus`** | Default for any list reorder |
| **`QTable` row reorder** | **`quasar-ui-q-draggable-table`** | **`v-draggable-table`**, boot **`q-draggable-table`** |
| **Hierarchical trees** | **`@he-tree/vue`** **`Draggable`** | Built-in DnD — **do not** use vue-draggable-plus on trees |
| **Floating / spatial move** | Custom pointer sessions | **`src/scripts/floatingWindows/`** — not this skill |

Deps in root **`package.json`**: **`vue-draggable-plus`**, **`quasar-ui-q-draggable-table`**.

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

Sortable root not component root → **`useDraggable(el, list, options)`** or **`v-draggable`** with selector — see upstream **target container** docs.

### Persistence

- Reorder updates in-memory array first; on **`@update`** / **`onEnd`**, write domain order (e.g. **`sort_order`**) via **`runFaActionAwait`** or store → **`projectContent`** IPC.
- Drag wiring in feature **`scripts/`**; thin **`.vue`** imports composable or **`VueDraggable`** only.

### Vertical tab strips (**`DialogProjectSettings`** worlds list)

Vertical category tabs reuse **`src/scripts/faDragDrop/`** (**`faVerticalDraggableTabsSortableDragOptions`**, **`faVerticalDraggableTabsDocumentDragCursor`**, **`hideNativeSortableDragGhost`**) + global SCSS **`src/css/theme/custom-components/faVerticalDraggableTabs.scss`**. **`DialogProjectSettingsWorldsTabList`**: **`vue-draggable-plus`** + movement threshold so short clicks select tab without drag. Palette swatch reorder: same library in **`DialogProjectSettingsWorldColorPaletteEditor`**.

#### Vertical draggable tab strips (reusable column)

Shared pattern: **left column** draggable tabs + optional **Add** row (master–detail settings dialogs). Not horizontal **`QTabs`** replacement — vertical reorderable list chrome only.

**Reference implementations**

| SFC | Role |
| --- | --- |
| **`DialogProjectSettingsWorldsTabList.vue`** | Worlds column; default width **240px** |
| **`DialogProjectSettingsDocumentTemplatesTabList.vue`** | Document templates column; **`tab-list-width-px="360"`** |
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

Import global styles once per feature via **`@use`** / **`src=`** on colocated unscoped SCSS (see **`DialogProjectSettings.worldsTabList.unscoped.scss`**). Base tokens: **`src/css/theme/custom-components/_faVerticalDraggableTabs.variables.scss`**.

**Layout props** (TabList host SFC; all optional with defaults):

| Prop | Default | Maps to CSS variable |
| --- | --- | --- |
| **`tabListWidthPx`** | **`240`** | **`--fa-vertical-draggable-tabs-column-width`** |
| **`tabPadding`** | **`'4px 40px 4px 60px'`** | **`--fa-vertical-draggable-tabs-tab-padding`** |
| **`tabTextAlign`** | **`'left'`** | **`--fa-vertical-draggable-tabs-tab-text-align`** |
| **`tabJustifyContent`** | **`'flex-start'`** | **`--fa-vertical-draggable-tabs-tab-justify-content`** |
| **`tabLabelTextTransform`** | **`'none'`** | **`--fa-vertical-draggable-tabs-tab-label-text-transform`** |
| **`tabLabelFontSize`** | **`'14px'`** | **`--fa-vertical-draggable-tabs-tab-label-font-size`** |
| **`dense`** | **`false`** (document templates TabList default **`true`**) | **`--fa-vertical-draggable-tabs-tab-min-height`** (**`36px`** when dense; SCSS fallback **`48px`**) |

Types: **`types/I_faVerticalDraggableTabs.ts`**. Defaults + **`buildFaVerticalDraggableTabsRootStyle`**: **`src/scripts/faDragDrop/functions/buildFaVerticalDraggableTabsRootStyle.ts`**.

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

**Drag wiring** (both reference TabLists):

- **`faVerticalDraggableTabsSortableDragOptions`** on **`VueDraggable`**
- **`touch-start-threshold="5"`** — tap-to-select without drag
- **`@start`** → **`applyFaVerticalDraggableTabsDocumentDragCursor`**
- **`@end`** → **`clearFaVerticalDraggableTabsDocumentDragCursor`** + emit reordered array
- Root **`computed`** class **`faVerticalDraggableTabs--listDragging`** while dragging
- Tab item modifiers: **`--active`**, **`--dragging`**, **`--error`**

**Tests**: **`src/scripts/faDragDrop/_tests/buildFaVerticalDraggableTabsRootStyle.vitest.test.ts`**; TabList Vitest stubs **`VueDraggable`**; Playwright uses **`data-test-locator`** on list, tabs, add button.

## `quasar-ui-q-draggable-table` (`QTable` rows)

Registered globally via **`src/boot/q-draggable-table.ts`** (**`quasar.config.ts`** **`boot`**).

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

- Import **`quasar-ui-q-draggable-table/dist/index.css`** from boot manager only (no per-SFC duplicate).
- Avoid **`virtual-scroll`** on same **`QTable`** when using row drag.
- Upstream: [github.com/bd2051/q-draggable-table](https://github.com/bd2051/q-draggable-table)

## Trees — use he-tree, not vue-draggable-plus

Nested hierarchies → [fantasia-he-tree](../fantasia-he-tree/SKILL.md): **`Draggable`** from **`@he-tree/vue`** owns reorder semantics.

### World template layout tree

**Project Settings** world template layout uses he-tree **`Draggable`** — see [fa-drag-drop-lists.mdc](../../rules/fa-drag-drop-lists.mdc) **World template layout tree** for component map, commit policy, wiring, validation, rename menu, tests. Do not duplicate that narrative here.

## Tests

- **Vitest**: mock **`vue-draggable-plus`** when mount-only smoke; test reorder helpers in **`scripts/_tests`** with pure array moves.
- **Playwright**: **`data-test-locator`** on handles; pointer APIs per [playwright-tests.mdc](../../rules/playwright-tests.mdc).

## Related

- [fa-drag-drop-lists.mdc](../../rules/fa-drag-drop-lists.mdc)
- [fa-he-tree.mdc](../../rules/fa-he-tree.mdc)
- [fantasia-floating-windows](../fantasia-floating-windows/SKILL.md) — spatial window drag
