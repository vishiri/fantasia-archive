---
name: fantasia-he-tree
description: >-
  Hierarchical tree UI with @he-tree/vue only — full project replacement for
  Quasar QTree (forbidden). Virtualization, drag-and-drop, Quasar slot styling.
  Use when adding or changing any nested tree in the renderer.
---

# Fantasia Archive — hierarchical trees (`@he-tree/vue`)

## Policy

Enforced detail: [fa-he-tree.mdc](../../rules/fa-he-tree.mdc).

- **`@he-tree/vue`** only tree UI (**`package.json`** dependency).
- **Quasar `QTree` / `q-tree` forbidden** — production, dialogs, layouts, Storybook, experiments.
- Upstream: [hetree.phphe.com](https://hetree.phphe.com/v2/guide/) (Vue 3 / v2).

## Why he-tree (not QTree)

**`QTree`** excluded. **`@he-tree/vue`**: virtual list for scale, optional DnD, slots for Quasar-styled rows.

## Installation (already in repo)

```bash
yarn add @he-tree/vue
```

## Basic usage (Vue 3 + script setup)

```vue
<template>
  <Draggable
    v-model="treeData"
    virtualization
    class="myFeatureTree hasScrollbar"
    :style="{ height: treeHeightPx + 'px' }"
    data-test-locator="myFeature-tree"
  >
    <template #default="{ node, stat }">
      <!-- Quasar + i18n inside the slot -->
      <span
        class="myFeatureTree__label"
        :data-test-locator="'myFeature-tree-node-' + node.id"
      >
        {{ node.label }}
      </span>
    </template>
  </Draggable>
</template>

<script setup lang="ts">
import { Draggable } from '@he-tree/vue'
import '@he-tree/vue/style/default.css'

const treeData = defineModel<Array<{ id: string, label: string, children?: unknown[] }>>('treeData', {
  required: true
})

const treeHeightPx = 400
</script>
```

- **`BaseTree`** — same API without drag when reorder not required.
- Import **`@he-tree/vue/style/default.css`** in owning SFC or wrapper.

## Virtualization checklist

1. Prop **`virtualization`** on **`BaseTree`** / **`Draggable`**.
2. Fixed **`height`** or **`max-height`** on tree or bounded scroll parent.
3. Lazy-load children from main/SQLite on first expand for huge projects.
4. Avoid expand-all on huge trees in one tick.

Related props: **`virtualization`**, **`virtualizationPrerenderCount`**.

## Drag-and-drop

- **`Draggable`** when users reorder nodes.
- **No** **`vue-draggable-plus`** on trees — he-tree owns hierarchical reorder ([fantasia-drag-drop](../fantasia-drag-drop/SKILL.md)).
- Tune **`dragOverThrottleInterval`** on large trees.
- Persist via Pinia + IPC after drop; validate in main with Zod where structured.

## Data and architecture

| Concern | Location |
| --- | --- |
| Node row UI, locators | Feature **`.vue`** (thin script) |
| DB → nodes, filter, selection | Feature **`scripts/`** or **`src/scripts/<domain>/`** |
| Shared walk/flatten/id-index | **`src/scripts/faHeTree/`** when reused |
| Shared interfaces | **`types/I_*.ts`** (`app/types/...`) |

Two-level: pure transforms in **`functions/`** (`import type` only); managers wire stores + IPC.

## Styling

- Override defaults in feature **`styles/`** ([component-styles-folder.mdc](../../rules/component-styles-folder.mdc)); BEM + semantic **`$`** tokens ([project-scss.mdc](../../rules/project-scss.mdc)).
- **`hasScrollbar`** when gutter stability matters.
- User strings in **`i18n/`**; node labels from data OK dynamic.

## Utilities

```ts
import { walkTreeData } from '@he-tree/vue'

walkTreeData(nodes, (node, index, parent) => {
  // visit
}, { childrenKey: 'children' })
```

Use **`walkTreeData`** for search, bulk expand, validation — not ad hoc recursion everywhere.

## Project Settings — world template layout

**`DialogProjectSettingsWorldTemplateLayoutTree.vue`** — **`Draggable`**, max depth 2, DnD rules in **`dialogProjectSettingsWorldTemplateLayoutDnD.ts`**, commit policy + wiring in feature **`scripts/`**. Full map: [fa-he-tree.mdc](../../rules/fa-he-tree.mdc) and [fa-drag-drop-lists.mdc](../../rules/fa-drag-drop-lists.mdc).

## Tests

- **Vitest** — mount SFC; stub IPC; assert **`data-test-locator`**
- **Playwright** — locators; rebuild Electron when wiring changes ([fantasia-testing](../fantasia-testing/SKILL.md))
- **Storybook** — modest mocked tree; import default CSS

## Related docs

- [fa-he-tree.mdc](../../rules/fa-he-tree.mdc)
- [AGENTS.md](../../../AGENTS.md) **Hierarchical trees (he-tree)**
- [fantasia-quasar-vue](../fantasia-quasar-vue/SKILL.md)
