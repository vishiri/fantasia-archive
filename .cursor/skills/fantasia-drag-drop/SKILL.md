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
