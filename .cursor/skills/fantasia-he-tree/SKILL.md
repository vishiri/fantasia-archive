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

### DnD + scroll preservation (layout tree playbook)

Full postmortem: this skill section below (**DnD + scroll preservation**). Reference: **`DialogProjectSettingsWorldTemplateLayoutTree.vue`**.

**Symptom:** drop moves data OK; **`scrollTop`** jumps (often top). Or add row does not scroll into view.

| Cause | Fix |
| --- | --- |
| **`:key` on `Draggable`** changes on reorder/remount | No `:key` for sort; **`resyncTreeDataFromProps`** updates **`treeData`** |
| Topology key uses draft **array order** or **sort fields** | Canonical key: sorted ids + **`groupId`** only — **`mapDialogProjectSettingsWorldTemplateLayoutToTreeStructureKey`** |
| Resync rebuilds **`treeData`** when topology unchanged | Match keys → **`patchWorldTemplateLayoutDisplayLabelsInHeTreeNodes`** only |
| **`overflow: auto`** on wrapper, not he-tree root | Scroll on **`.dialogProjectSettingsWorldTemplateLayoutTree`**; host sizing only — **`resolveDialogProjectSettingsWorldTemplateLayoutTreeScrollContainer`** |
| Post-drop **`scrollTop` restore** | **Do not** — fights virtualization; fix remount/rebuild instead |

**Workspace hierarchy (`ProjectHierarchyTree`):** expand truth = **`openNodeIds` / he-tree stats** — never derive drag expand snapshots from mounted DOM rows (virt omits off-screen). No **`:key` remount**; soft resync only. Post-drop expand reapply can zero vtlist **`scrollTop`** — preserve/restore around commit finalize (not a substitute for remount). he-tree does **not** forward `@virtual-list/vue` **`buffer`**; hierarchy manager mutates VirtualList default (~10 row heights) before mount.

**Pipeline:** `@before-drag-start` → v-model during drag → `@after-drop` → deferred **`emitLayoutFromTreeDataIfChanged`** → props watch **`resyncTreeDataFromProps`**. Append: separate count watch → **`scheduleScrollContainerToRevealLastItem`**.

**Debug:** compare topology keys layout vs **`mapHeTreeNodesToWorldTemplateLayoutDraft(treeData)`** after drop; check resync rebuild vs patch; find real scroll element in DevTools.

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

**`DialogProjectSettingsWorldTemplateLayoutTree.vue`** — **`Draggable`**, max depth 2, DnD rules in **`dialogProjectSettingsWorldTemplateLayoutDnD.ts`**, commit policy + wiring in feature **`scripts/`**. DnD scroll playbook: this skill **DnD + scroll preservation**. Full map: [fa-he-tree.mdc](../../rules/fa-he-tree.mdc) and [fa-drag-drop-lists.mdc](../../rules/fa-drag-drop-lists.mdc).

## Tests

- **Vitest** — mount SFC; stub IPC; assert **`data-test-locator`**
- **Playwright** — locators; rebuild Electron when wiring changes ([fantasia-testing](../fantasia-testing/SKILL.md))
- **Storybook** — modest mocked tree; import default CSS

## Related docs

- [fa-he-tree.mdc](../../rules/fa-he-tree.mdc)
- [AGENTS.md](../../../AGENTS.md) **Hierarchical trees (he-tree)**
- [fantasia-quasar-vue](../fantasia-quasar-vue/SKILL.md)
