---
name: fantasia-document-workspace-edit-state
description: >-
  Per-tab editState on opened workspace documents: preview (read-only) vs edit
  (inputs). Use when adding DocumentWorkspacePage fields, tab session state, or
  opened_documents snapshot columns.
---

# Document workspace editState

## Product rule

Opened document tabs distinguish **preview mode** (browsing, read-only) from **edit mode** (editing). Default = preview (**`editState: false`**).

Users should see document content without accidental edits until they explicitly enter edit mode (toggle UI future work).

## Data

| Piece | Location |
| --- | --- |
| Tab field | **`I_faOpenedDocumentTab.editState`** — **`types/I_faOpenedDocumentsDomain.ts`** |
| Default constant | **`FA_OPENED_DOCUMENT_DEFAULT_EDIT_STATE`** (**`false`**) |
| New tab seed | **`createFaOpenedDocumentTabFromOpenMeta`** in **`faOpenedDocumentsStoreActions.ts`** |
| Persist | **`faOpenedDocumentsSnapshotSchema`** — **`editState`** per tab; Zod **`.default(false)`** for legacy JSON |
| Store | **`S_FaOpenedDocuments`** — session + debounced SQLite write |

## Pure domain

**`src/scripts/openedDocuments/functions/openedDocumentEditStateDomain.ts`**

Use these in managers / store wiring; inject into page composable factories (level-1 **`functions/`** cannot value-import project modules).

## UI pattern — DocumentWorkspacePage

```
documentShowsPreview  → read-only blocks (h4 title for name today)
documentShowsEditFields → q-input and future editors
```

Both derive from active route tab **`editState`** via **`createUseDocumentWorkspacePage`**.

### New field template

```vue
<section v-if="documentShowsPreview" data-test-locator="documentWorkspacePage-<field>-preview">
  <!-- read-only value -->
</section>
<q-input
  v-if="documentShowsEditFields"
  data-test-locator="documentWorkspacePage-<field>-input"
  ...
/>
```

Replace **`<field>`** with stable test slug. Keep preview and edit locators distinct.

## Tests

- **`openedDocumentEditStateDomain.vitest.test.ts`** — flags + display name + normalize
- **`createUseDocumentWorkspacePage.vitest.test.ts`** — preview vs edit visibility
- Tab fixtures: always include **`editState: false`** unless testing edit branch

## Control bar strip (FA 1.0 parity)

**`ProjectAppControlBar`** fixed strip **`projectAppControlBar__wrapper`** / **`__right`**:

| Button | Icon | Visible when | Color |
| --- | --- | --- | --- |
| Edit | **`mdi-file-document-edit`** | Preview + document route + active tab | **`primary-bright`** outline |
| Save without exiting edit mode | **`mdi-content-save-edit`** | Edit mode | **`primary-bright`** if clean, **`teal-14`** if **`hasUnsavedChanges`** |
| Save | **`mdi-content-save`** | Edit mode | same as save-without-exit |

Store: **`enterDocumentEditMode`**, **`saveDocumentDisplayName(documentId, { keepEditMode })`** — save uses **`projectContent.updateDocument`**, queues **`S_FaProjectHierarchyTree.refreshDocumentsInTree`** (tree session reloads sibling bucket + re-applies expand state), exits preview when **`keepEditMode: false`**.

## Not in scope yet
- Auto-enter edit on double-click / keybind
- Separate per-field edit locks (single tab-level **`editState`** for now)

## Related

- Rule: [fa-document-workspace-edit-state.mdc](../../rules/fa-document-workspace-edit-state.mdc)
- [fantasia-quasar-vue](fantasia-quasar-vue/SKILL.md), [fantasia-sqlite-main](fantasia-sqlite-main/SKILL.md)
