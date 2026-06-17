# `.faproject` SQLite schema and APIs

User project = single SQLite **`.faproject`**. Main opens **`better-sqlite3`**, runs migrations, serves renderer via preload IPC. Canonical schema + module map.

## Naming: `documents` table vs UI markdown documents

SQLite **`documents`** = worldbuilding entities (world + optional template). ≠ help/license **markdown** from **`i18n/.../documents/*.md`** or **`T_documentName`** dialogs. Keep SQL/table copy separate from markdown dialog naming.

## Schema version (`PRAGMA user_version`)

| Version | Contents |
|---------|----------|
| **0** | Uninitialized file (bootstrap target on first open/create). |
| **1** | Full schema: **`project_data`** KV, worldbuilding **content tables** (including **`world_template_groups`** / **`world_template_placements`** layout), default **world** seed on create. |
| **2** | Drops legacy **`world_media`** junction table only. |
| **3** | Ensures **`world_document_templates`** exists (restores the junction for files that lost it at an interim **v2**). |
| **4** | Adds **`worlds.color_pallete`** — semicolon-separated **`#RRGGBB`** hex list (max **2000** chars; default empty). |
| **5** | Adds **`document_templates.sort_order`**, **`world_appendix`** (max **500** chars), and **`icon`** (max **128** chars). |
| **6** | Replaces **`world_document_templates`** with **`world_template_groups`** and **`world_template_placements`** for per-world template layout (groups + ordered placements). |

**Supported max:** **`FA_PROJECT_USER_VERSION_SUPPORTED_MAX = 6`** in **`faProjectDbMigrateWiring.ts`**.

**Migration entry:** **`applyFaProjectMigrations(db, displayProjectName)`** — fresh files start at **0**, bootstrap to **v1**, run **v1→v2** (drop **`world_media`**), **v2→v3** (ensure legacy **`world_document_templates`** when upgrading old files), **v3→v4** (add **`worlds.color_pallete`**), **v4→v5** (add **`document_templates`** list/detail columns), **v5→v6** (migrate junction rows to root placements, drop **`world_document_templates`**, create layout tables), seed a default **world** when empty, then stop at **v6**. Files already at **6** are a no-op. Other versions throw until a forward migration is added.

**Worlds vs document templates on create:** **`seedFaProjectDefaultWorldIfEmpty`** runs after migrations and inserts one default **world** when the table is empty. **Document templates are never auto-seeded** — a new **`.faproject`** may have zero **`document_templates`** rows until the user adds them in **Project Settings**.

**DDL source:** **`src-electron/mainScripts/projectManagement/functions/faProjectDbSchemaDdl.ts`** (**`applyFaProjectProjectDataSchemaV1`**, **`applyFaProjectContentSchemaV1`**).

**Pre-release flatten:** Dev may squash schema versions back to **1**; no upgrade for older local files — **`.cursor/skills/fantasia-flatten-database-schemas/SKILL.md`**.

**Product ↔ SQL naming:** UI “world name” / “template name” → **`display_name`** on **`worlds`** / **`document_templates`**. Per-world template layout in **`world_template_groups`** + **`world_template_placements`**; each template at most once per world. **Project Settings** enforces invariant client-side before save (duplicate **`document_template_id`** placements block **Save settings** with validation chrome).

## Table: `project_data` (key–value)

| `option_name` | Role |
|---------------|------|
| **`project_name`** | Display name (also surfaced as project settings **`projectName`**) |
| **`project_uuid`** | Stable logical project id (UUID string) |
| **`project_noteboard_content`** | Project noteboard text |
| **`project_noteboard_x`**, **`project_noteboard_y`**, **`project_noteboard_width`**, **`project_noteboard_height`** | Project noteboard frame (pixels) |
| **`project_styling_content`** | Per-project custom CSS |
| **`project_styling_x`**, **`project_styling_y`**, **`project_styling_width`**, **`project_styling_height`** | Project styling floating window frame |

**Modules:** **`faProjectDataKvWiring.ts`**, **`faProjectSettingsPersistWiring.ts`**, **`faProjectNoteboardPersistWiring.ts`**, **`faProjectStylingPersistWiring.ts`**.

## Content tables (schema version 1)

PKs **TEXT UUID v4** on entity tables. Timestamps **`created_at_ms`** / **`updated_at_ms`** (Unix ms).

### `worlds`

| Column | Type | Notes |
|--------|------|--------|
| `id` | TEXT PK | UUID |
| `display_name` | TEXT | Non-empty (product “name”) |
| `color` | TEXT | **`#RRGGBB`** hex; default **`#808080`** |
| `color_pallete` | TEXT | Semicolon-separated **`#RRGGBB`** hex list (max **2000** chars); default empty |
| `sort_order` | INTEGER | Zero-based GUI order; new worlds append **`MAX(sort_order) + 1`** |
| `created_at_ms`, `updated_at_ms` | INTEGER | |

Index: **`idx_worlds_sort_order`**. New **`.faproject`** files receive one default world row whose **`display_name`** matches the project name at create time.

### `document_templates`

| Column | Type | Notes |
|--------|------|--------|
| `id` | TEXT PK | UUID |
| `display_name` | TEXT | Non-empty (product “name”) |
| `sort_order` | INTEGER | Zero-based GUI order from Project Settings draggable list |
| `world_appendix` | TEXT | Optional product copy (max **500** chars; default empty) |
| `icon` | TEXT | Optional icon name string (max **128** chars; default empty) |
| `created_at_ms`, `updated_at_ms` | INTEGER | |

Index: **`idx_document_templates_sort_order`**. Unlike **worlds**, new projects **do not** receive a default template row at create time.

### `media`

| Column | Type | Notes |
|--------|------|--------|
| `id` | TEXT PK | UUID |
| `display_name` | TEXT | Non-empty |
| `created_at_ms`, `updated_at_ms` | INTEGER | |

### `documents`

| Column | Type | Notes |
|--------|------|--------|
| `id` | TEXT PK | UUID |
| `world_id` | TEXT FK → `worlds.id` | **ON DELETE RESTRICT** |
| `template_id` | TEXT FK → `document_templates.id`, nullable | **ON DELETE RESTRICT** |
| `display_name` | TEXT | |
| `created_at_ms`, `updated_at_ms` | INTEGER | |

**World → documents (1:N):** enforced by required **`world_id`**. Deleting a **world** that still has **documents** fails at the database (**RESTRICT**).

**Document → template (N:1):** optional **`template_id`**. Deleting a **template** referenced by documents fails (**RESTRICT**).

### `document_media` (M:N)

| Column | Notes |
|--------|--------|
| `document_id` | FK → `documents.id` **ON DELETE CASCADE** |
| `media_id` | FK → `media.id` **ON DELETE CASCADE** |
| PRIMARY KEY (`document_id`, `media_id`) | |

### `world_template_groups` (schema v6)

| Column | Notes |
|--------|--------|
| `id` | TEXT PK (UUID) |
| `world_id` | FK → **`worlds.id`** **ON DELETE CASCADE** |
| `display_name` | Non-empty group label |
| `root_sort_order` | Position among root-level groups and root-level template placements |
| `created_at_ms`, `updated_at_ms` | INTEGER |

Index: **`idx_world_template_groups_world_root_sort`**.

### `world_template_placements` (schema v6)

| Column | Notes |
|--------|--------|
| `id` | TEXT PK (UUID placement id) |
| `world_id` | FK → **`worlds.id`** **ON DELETE CASCADE** |
| `document_template_id` | FK → **`document_templates.id`** **ON DELETE CASCADE** |
| `group_id` | NULL for root placement; else FK → **`world_template_groups.id`** **ON DELETE SET NULL** |
| `root_sort_order` | Set when **`group_id`** is NULL |
| `group_sort_order` | Set when **`group_id`** is not NULL |
| `created_at_ms`, `updated_at_ms` | INTEGER |

**Constraints:** **`UNIQUE (world_id, document_template_id)`**; CHECK enforces exactly one of **`root_sort_order`** / **`group_sort_order`** matching **`group_id`**.

Indexes: **`idx_world_template_placements_world_root_sort`**, **`idx_world_template_placements_group_sort`**, **`idx_world_template_placements_document_template_id`**.

**Legacy (v1–v5):** **`world_document_templates`** M:N junction — removed at **v6**; existing links migrate to root **`world_template_placements`** rows ordered by template **`sort_order`**.

Indexes: **`idx_documents_world_id`**, **`idx_documents_template_id`**, **`idx_document_media_media_id`**, **`idx_worlds_sort_order`**, **`idx_document_templates_sort_order`**.

## Relationships (summary)

| Relationship | Implementation |
|--------------|----------------|
| World → documents | `documents.world_id` |
| Document → template | `documents.template_id` (nullable) |
| Document ↔ media | `document_media` |
| World template layout | **`world_template_groups`** + **`world_template_placements`** (one placement per template per world) |
| Template → field definitions (planned) | `template_fields` — see [templateCustomFields.md](templateCustomFields.md) |
| Document → custom field values (planned) | `document_field_values`, link tables — see [templateCustomFields.md](templateCustomFields.md) |

**Link helpers (FK assignment):** **`setFaProjectDocumentWorld`**, **`setFaProjectDocumentTemplate`** in **`faProjectDocumentsPersistWiring.ts`**.

## Planned extensions (after version 4)

Template custom fields (defs, typed values, orphan retention) in [templateCustomFields.md](templateCustomFields.md); future migration; table detail lands here when shipped.

## Main-process module map

```
src-electron/mainScripts/projectManagement/
  faProjectDbMigrateWiring.ts          # migrations, metadata read helpers
  faProjectDatabaseEnsureConnectedWiring.ts  # runWithFaProjectDatabase* (required entry)
  faProjectDataKvWiring.ts
  faProjectSettingsPersistWiring.ts
  faProjectNoteboardPersistWiring.ts
  faProjectStylingPersistWiring.ts
  functions/
    faProjectDbSchemaDdl.ts             # schema v1 DDL
    faProjectContentRowMap.ts           # row → DTO mappers
  projectDbContent/
    faProjectContentNamedEntitySqlWiring.ts
    faProjectWorldsSqlWiring.ts
    faProjectWorldBootstrapWiring.ts
    faProjectWorldsPersistWiring.ts
    faProjectDocumentsPersistWiring.ts
    faProjectDocumentTemplatesPersistWiring.ts
    faProjectDocumentTemplatesSqlWiring.ts
    faProjectDocumentTemplatesSnapshotWiring.ts
    faProjectMediaPersistWiring.ts
    faProjectWorldsSnapshotWiring.ts
    faProjectWorldTemplateLayoutReadWiring.ts
    faProjectWorldTemplateLayoutSnapshotWiring.ts
    faProjectWorldTemplateLayoutSqlWiring.ts
    faProjectDocumentMediaLinksWiring.ts
```

**Barrel:** **`projectManagement_manager.ts`** re-exports lifecycle + **`runWithFaProjectDatabase*`**; content persist modules imported from IPC registration.

## IPC: project lifecycle vs content

### `FA_PROJECT_MANAGEMENT_IPC`

Create/open project, recent list, **project settings / styling / noteboard** patches. Preload: **`projectManagementAPI.ts`**. Registrar: **`registerFaProjectManagementIpc.ts`**.

### `FA_PROJECT_CONTENT_IPC`

CRUD + links for **worlds**, **documents**, **document_templates**, **media**, junction ops. Preload: **`projectContentAPI.ts`** → **`window.faContentBridgeAPIs.projectContent`**. Registrar: **`registerFaProjectContentIpc.ts`** (**`ipcManagementRegistrationWiring.ts`**).

All content handlers wrap **`runWithFaProjectDatabaseForIpcAsync`**.

| IPC channel (suffix `-async`) | Persist / behavior |
|-----------------------------|-------------------|
| `create-world-async` | `createFaProjectWorld` |
| `update-world-async` | `updateFaProjectWorld` |
| `delete-world-async` | `deleteFaProjectWorld` |
| `get-world-by-id-async` | `getFaProjectWorldById` |
| `list-worlds-async` | `listFaProjectWorlds` |
| `list-worlds-for-project-settings-async` | `listFaProjectWorldsForProjectSettings` (includes per-world document counts) |
| `save-worlds-snapshot-async` | `replaceFaProjectWorldsSnapshot` (transactional full list replace from Project Settings) |
| `create-media-async` | `createFaProjectMedia` |
| `update-media-async` | `updateFaProjectMedia` |
| `delete-media-async` | `deleteFaProjectMedia` |
| `get-media-by-id-async` | `getFaProjectMediaById` |
| `list-media-async` | `listFaProjectMedia` |
| `create-document-template-async` | `createFaProjectDocumentTemplate` |
| `update-document-template-async` | `updateFaProjectDocumentTemplate` |
| `delete-document-template-async` | `deleteFaProjectDocumentTemplate` |
| `get-document-template-by-id-async` | `getFaProjectDocumentTemplateById` |
| `list-document-templates-async` | `listFaProjectDocumentTemplates` |
| `list-document-templates-for-project-settings-async` | `listFaProjectDocumentTemplatesForProjectSettings` (ordered rows with document counts for delete guards) |
| `save-document-templates-snapshot-async` | `replaceFaProjectDocumentTemplatesSnapshot` (transactional full list replace from Project Settings; **empty list allowed**) |
| `create-document-async` | `createFaProjectDocument` |
| `update-document-async` | `updateFaProjectDocument` |
| `delete-document-async` | `deleteFaProjectDocument` |
| `get-document-by-id-async` | `getFaProjectDocumentById` |
| `list-documents-async` | `listFaProjectDocuments` (optional `worldId` filter) |
| `set-document-world-async` | `setFaProjectDocumentWorld` |
| `set-document-template-async` | `setFaProjectDocumentTemplate` |
| `link-document-media-async` | `linkFaProjectDocumentMedia` |
| `unlink-document-media-async` | `unlinkFaProjectDocumentMedia` |
| `list-document-media-async` | `listFaProjectMediaForDocument` |

Exact channel strings: **`src-electron/electron-ipc-bridge.ts`** (`FA_PROJECT_CONTENT_IPC`).

## Project Settings (renderer ↔ SQLite)

**`DialogProjectSettings`** (**`src/components/dialogs/DialogProjectSettings/`**) — first shipped **`projectContent`** UI.

| Phase | API | Main |
|-------|-----|------|
| **Open** | **`projectManagement.getProjectSettings`** (project name KV) + **`projectContent.listWorldsForProjectSettings`** (ordered worlds with document counts for delete guards) + **`projectContent.listDocumentTemplatesForProjectSettings`** (ordered templates with document counts) | **`readFaProjectSettingsRoot`**, **`listFaProjectWorldsForProjectSettings`**, **`listFaProjectDocumentTemplatesForProjectSettings`** |
| **Save (project name)** | **`projectManagement.setProjectSettings`** via **`S_FaProjectSettings`** | **`faProjectSettingsPersist.ts`** → **`project_name`** KV |
| **Save (worlds)** | **`projectContent.saveWorldsSnapshot`** with **`I_faProjectWorldSnapshotItem[]`** (optional **`templateLayout`** per world) | **`replaceFaProjectWorldsSnapshot`** in **`faProjectWorldsSnapshotWiring.ts`** — one transaction: upsert/reorder worlds, replace each world's template layout when provided, delete removed ids (**RESTRICT** if a world still has documents) |
| **Save (document templates)** | **`projectContent.saveDocumentTemplatesSnapshot`** with **`I_faProjectDocumentTemplateSnapshotItem[]`** | **`replaceFaProjectDocumentTemplatesSnapshot`** in **`faProjectDocumentTemplatesSnapshotWiring.ts`** — one transaction: upsert/reorder by list index, delete removed ids (**RESTRICT** if documents still reference a template); **zero templates is valid** |

Bridges: **`sFaProjectWorldsBridge.ts`**, **`sFaProjectDocumentTemplatesBridge.ts`**. Action **`saveProjectSettings`** may carry **`settings`**, **`worlds`**, **`documentTemplates`** (**`handleSaveProjectSettings`** in **`createFaActionDefinitionHandlers.ts`**). Draft validation (names, duplicate palette hex) stays in dialog; persist coerces hex via **`coerceFaProjectWorldColorForStorage`**, **`coerceFaProjectWorldColorPalleteForStorage`**.

## Types and validation

- DTOs: **`types/I_faProjectWorldDomain.ts`**, **`I_faProjectDocumentDomain.ts`**, **`I_faProjectDocumentTemplateDomain.ts`**, **`I_faProjectMediaDomain.ts`**, **`I_faProjectContentLinksDomain.ts`**, **`I_faProjectContentAPI.ts`**
- Zod (IPC payloads): **`src-electron/shared/faProject*ContentSchema.ts`**, **`faProjectContentLinksSchema.ts`**, **`faProjectContentSchemaShared.ts`**
- Bridge typing: **`types/I_faElectronRendererBridgeAPIs.ts`**, **`src/globals.d.ts`**

**Renderer UI:** **`DialogProjectSettings`** (general, worlds, **Document Template Settings**), **`FaColorPickerInput`**, **`FaIconPickerInput`** (template **icon**), **`sFaProjectWorldsBridge`**, **`sFaProjectDocumentTemplatesBridge`**. Other content surfaces IPC-only until wired.

## Errors

Missing entity ids → **`FaProjectContentNotFoundError`** (`faProjectContentNotFoundError.ts`); IPC **`invoke`** rejects to callers.

## Testing

- Migrations: **`src-electron/mainScripts/projectManagement/_tests/faProjectDbMigrate.vitest.test.ts`**
- DDL / row map: **`functions/_tests/faProjectDbSchemaDdl.vitest.test.ts`**, **`faProjectContentRowMap.vitest.test.ts`**
- Persist (mock DB): **`projectDbContent/_tests/faProjectContentPersist.vitest.test.ts`**
- IPC: **`ipcManagement/_tests/registerFaProjectContentIpc.vitest.test.ts`**
- Preload: **`contentBridgeAPIs/_tests/projectContentAPI.vitest.test.ts`**
- Zod: **`shared/_tests/faProjectContentSchemas.vitest.test.ts`**

Vitest uses mock **`better-sqlite3`** in unit tests; native ABI validated in production Electron builds, not **`unit-electron`**.
