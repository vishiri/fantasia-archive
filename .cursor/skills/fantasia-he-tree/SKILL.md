---
name: fantasia-he-tree
description: >-
  Hierarchical tree UI with @he-tree/vue only — full project replacement for
  Quasar QTree (forbidden). Virtualization, drag-and-drop, Quasar slot styling.
  Use when adding or changing any nested tree in the renderer.
---

# Fantasia Archive — hierarchical trees (`@he-tree/vue`)

## Policy

- **`@he-tree/vue`** is the **only** tree UI library for this project (`package.json` dependency **`@he-tree/vue`**).
- **Quasar `QTree` / `q-tree` is forbidden everywhere** — production UI, dialogs, layouts, Storybook product stories, and experiments. Do not import or register **`QTree`**.
- **`@he-tree/vue`** fully replaces **`QTree`** for every hierarchical surface (small pickers and large browsers alike).
- Upstream docs: [hetree.phphe.com](https://hetree.phphe.com/v2/guide/) (Vue 3 / **`@he-tree/vue`** v2).

## Why he-tree (not QTree)

Quasar **`QTree`** is excluded from the codebase. **`@he-tree/vue`** is the maintained standard: **virtual list** rendering for scale, optional **drag-and-drop**, and slots for Quasar-styled node rows.

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

- **`BaseTree`** — same API surface without drag plugins when reorder is not required.
- Import **`@he-tree/vue/style/default.css`** in the SFC (or a single wrapper component) that owns the tree.

## Virtualization checklist

1. Set prop **`virtualization`** on **`BaseTree`** / **`Draggable`**.
2. Give the tree or scroll parent a **fixed `height` or `max-height`** (pixels or flex layout with a bounded column). Unbounded auto height breaks virtual mode.
3. Prefer **lazy-loaded children** from main/SQLite on first expand for very large projects.
4. Avoid **expand-all** on huge trees in one tick; expand by level or user action.

Related props: **`virtualization`**, **`virtualizationPrerenderCount`**.

## Drag-and-drop

- Use **`Draggable`** (not **`BaseTree`**) when users reorder nodes.
- **Do not** use **`vue-draggable-plus`** on tree surfaces — he-tree owns hierarchical reorder ([fantasia-drag-drop](../fantasia-drag-drop/SKILL.md), [fa-drag-drop-lists.mdc](../../rules/fa-drag-drop-lists.mdc)).
- Tune **`dragOverThrottleInterval`** if drag-hover feels heavy on large trees.
- Persist new order through existing Pinia + IPC patterns after drop (validate in main with Zod where payloads are structured).

## Data and architecture

| Concern | Location |
| --- | --- |
| Node row UI, locators | Feature **`.vue`** (thin script) |
| Map DB rows → tree nodes, filter, selection | Feature **`scripts/`** or **`src/scripts/<domain>/`** |
| Shared walk/flatten/id-index helpers | **`src/scripts/faHeTree/`** when reused |
| Shared interfaces | **`types/I_*.ts`** (`app/types/...`) |

Follow two-level architecture: pure transforms in **`functions/`** with **`import type`** only; managers wire stores and IPC.

## Styling

- Override **`@he-tree/vue`** defaults in the feature **`styles/`** folder ([component-styles-folder.mdc](../../rules/component-styles-folder.mdc)) using BEM block names and semantic **`$`** tokens — not raw Quasar palette variables in consumer SCSS ([project-scss.mdc](../../rules/project-scss.mdc)).
- Use **`hasScrollbar`** on the scroll container when scrollbar gutter stability matters.
- Keep user-visible strings in **`i18n/`**; node labels from data may stay dynamic.

## Utilities

```ts
import { walkTreeData } from '@he-tree/vue'

walkTreeData(nodes, (node, index, parent) => {
  // visit
}, { childrenKey: 'children' })
```

Use **`walkTreeData`** for search, bulk expand, or validation instead of ad hoc recursion in many features.

## Project Settings — world template layout

**Project Settings → Worlds settings** uses **`Draggable`** from **`@he-tree/vue`** for the per-world **World template layout** tree (**`DialogProjectSettingsWorldTemplateLayoutTree.vue`**):

- **Max depth 2:** root interleaves **groups** and **templates**; only **templates** nest under **groups** (no template-under-template, no nested groups).
- **DnD rules** live in **`dialogProjectSettingsWorldTemplateLayoutDnD.ts`** (`eachDraggable`, `eachDroppable`, `rootDroppable`).
- **Right column** lists global templates not yet placed in the selected world; click adds a root placement (user drags into groups afterward).
- **Styles:** **`DialogProjectSettings.worldTemplateLayoutTree.unscoped.scss`** plus default he-tree CSS import in the tree SFC.

## Tests

- **Vitest** — mount the feature SFC; stub heavy IPC; assert **`data-test-locator`** on root and sample nodes.
- **Playwright** — locators on **`data-test-locator`**; rebuild Electron before component tests when tree wiring changes ([fantasia-testing](../fantasia-testing/SKILL.md)).
- **Storybook** — canvas story with a modest mocked tree; import **`@he-tree/vue/style/default.css`** in the story or SFC under test.

## Related docs

- [fa-he-tree.mdc](../../rules/fa-he-tree.mdc)
- [AGENTS.md](../../../AGENTS.md) **Hierarchical trees (he-tree)**
- [README.md](../../../README.md) **Architecture**
- [fantasia-quasar-vue](../fantasia-quasar-vue/SKILL.md) component layout
