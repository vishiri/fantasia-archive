# `.faproject` SQLite schema and APIs

Each user project is a single SQLite database file with the **`.faproject`** extension. The main process opens it with **`better-sqlite3`**, applies migrations, and serves the renderer through preload IPC. This document is the canonical schema and module map.

## Naming: `documents` table vs UI markdown documents

The SQLite table **`documents`** stores **worldbuilding document entities** (rows tied to a **world** and optional **template**). It is **not** the same as in-app help or license **markdown** loaded from **`i18n/.../documents/*.md`** or **`T_documentName`** dialog routing. When adding features, keep SQL/table copy separate from markdown dialog naming.

## Schema version (`PRAGMA user_version`)

| Version | Contents |
|---------|----------|
| **0** | Uninitialized file (bootstrap target on first open/create). |
| **1** | Full schema: **`project_data`** KV, worldbuilding **content tables** (including **`world_document_templates`**), default **world** seed on create. |
| **2** | Drops legacy **`world_media`** junction table only. |
| **3** | Ensures **`world_document_templates`** exists (restores the junction for files that lost it at an interim **v2**). |
| **4** | Adds **`worlds.color_pallete`** — semicolon-separated **`#RRGGBB`** hex list (max **2000** chars; default empty). Current max. |

**Supported max:** **`FA_PROJECT_USER_VERSION_SUPPORTED_MAX = 4`** in **`faProjectDbMigrateWiring.ts`**.

**Migration entry:** **`applyFaProjectMigrations(db, displayProjectName)`** — fresh files start at **0**, bootstrap to **v1**, run **v1→v2** (drop **`world_media`**), **v2→v3** (ensure **`world_document_templates`**), **v3→v4** (add **`worlds.color_pallete`**), seed a default **world** when empty, then stop at **v4**. Files already at **4** are a no-op. Other versions throw until a forward migration is added.

**DDL source:** **`src-electron/mainScripts/projectManagement/functions/faProjectDbSchemaDdl.ts`** (**`applyFaProjectProjectDataSchemaV1`**, **`applyFaProjectContentSchemaV1`**).

**Pre-release flatten:** During dev, schema versions may be squashed back to **1** with no upgrade path for older local files — see **`.cursor/skills/fantasia-flatten-database-schemas/SKILL.md`**.

**Product ↔ SQL naming:** UI “world name” / “template name” map to **`display_name`** on **`worlds`** and **`document_templates`**. Optional world ↔ template associations use the **`world_document_templates`** junction (many-to-many).

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

Primary keys are **TEXT UUID v4** on entity tables. Timestamps are **`created_at_ms`** / **`updated_at_ms`** (Unix ms).

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
| `created_at_ms`, `updated_at_ms` | INTEGER | |

Typed **field definitions** on templates are **planned** — see [templateCustomFields.md](templateCustomFields.md). World associations are optional and many-to-many via **`world_document_templates`** (below).

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

### `world_document_templates` (M:N)

| Column | Notes |
|--------|--------|
| `world_id` | FK → `worlds.id` **ON DELETE CASCADE** |
| `document_template_id` | FK → `document_templates.id` **ON DELETE CASCADE** |
| PRIMARY KEY (`world_id`, `document_template_id`) | |

A template may be linked to zero, one, or many worlds; a world may link to zero, one, or many templates. Links are independent of **`documents.template_id`** (documents still pick at most one template per row).

Indexes: **`idx_documents_world_id`**, **`idx_documents_template_id`**, **`idx_document_media_media_id`**, **`idx_world_document_templates_document_template_id`**, **`idx_worlds_sort_order`**.

## Relationships (summary)

| Relationship | Implementation |
|--------------|----------------|
| World → documents | `documents.world_id` |
| Document → template | `documents.template_id` (nullable) |
| Document ↔ media | `document_media` |
| World ↔ document template | `world_document_templates` (optional M:N) |
| Template → field definitions (planned) | `template_fields` — see [templateCustomFields.md](templateCustomFields.md) |
| Document → custom field values (planned) | `document_field_values`, link tables — see [templateCustomFields.md](templateCustomFields.md) |

**Link helpers (FK assignment):** **`setFaProjectDocumentWorld`**, **`setFaProjectDocumentTemplate`** in **`faProjectDocumentsPersistWiring.ts`**.

## Planned extensions (after version 3)

Custom fields on document templates (field definitions, typed values, orphan retention) are specified in [templateCustomFields.md](templateCustomFields.md) and will land in a future migration; table detail moves into this file when that ships.

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
    faProjectMediaPersistWiring.ts
    faProjectWorldsSnapshotWiring.ts
    faProjectDocumentMediaLinksWiring.ts
    faProjectWorldDocumentTemplateLinksWiring.ts
```

**Barrel:** **`projectManagement_manager.ts`** re-exports lifecycle and **`runWithFaProjectDatabase*`**; content persist modules are imported directly from IPC registration.

## IPC: project lifecycle vs content

### `FA_PROJECT_MANAGEMENT_IPC`

Create/open project, recent list, **project settings / styling / noteboard** patches. Preload: **`projectManagementAPI.ts`**. Registrar: **`registerFaProjectManagementIpc.ts`**.

### `FA_PROJECT_CONTENT_IPC`

CRUD and links for **worlds**, **documents**, **document_templates**, **media**, and junction operations. Preload: **`projectContentAPI.ts`** → **`window.faContentBridgeAPIs.projectContent`**. Registrar: **`registerFaProjectContentIpc.ts`** (registered from **`ipcManagementRegistrationWiring.ts`**).

All content handlers wrap work in **`runWithFaProjectDatabaseForIpcAsync`**.

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
| `link-world-document-template-async` | `linkFaProjectWorldDocumentTemplate` |
| `unlink-world-document-template-async` | `unlinkFaProjectWorldDocumentTemplate` |
| `list-document-templates-for-world-async` | `listFaProjectDocumentTemplatesForWorld` |
| `list-worlds-for-document-template-async` | `listFaProjectWorldsForDocumentTemplate` |

Exact channel strings: **`src-electron/electron-ipc-bridge.ts`** (`FA_PROJECT_CONTENT_IPC`).

## Types and validation

- DTOs: **`types/I_faProjectWorldDomain.ts`**, **`I_faProjectDocumentDomain.ts`**, **`I_faProjectDocumentTemplateDomain.ts`**, **`I_faProjectMediaDomain.ts`**, **`I_faProjectContentLinksDomain.ts`**, **`I_faProjectContentAPI.ts`**
- Zod (IPC payloads): **`src-electron/shared/faProject*ContentSchema.ts`**, **`faProjectContentLinksSchema.ts`**, **`faProjectContentSchemaShared.ts`**
- Bridge typing: **`types/I_faElectronRendererBridgeAPIs.ts`**, **`src/globals.d.ts`**

**Renderer (this release):** IPC + preload + types only — **no** Pinia stores or UI yet.

## Errors

Missing entity ids throw **`FaProjectContentNotFoundError`** (`faProjectContentNotFoundError.ts`); IPC **`invoke`** rejects and surfaces to callers.

## Testing

- Migrations: **`src-electron/mainScripts/projectManagement/_tests/faProjectDbMigrate.vitest.test.ts`**
- DDL / row map: **`functions/_tests/faProjectDbSchemaDdl.vitest.test.ts`**, **`faProjectContentRowMap.vitest.test.ts`**
- Persist (mock DB): **`projectDbContent/_tests/faProjectContentPersist.vitest.test.ts`**
- IPC: **`ipcManagement/_tests/registerFaProjectContentIpc.vitest.test.ts`**
- Preload: **`contentBridgeAPIs/_tests/projectContentAPI.vitest.test.ts`**
- Zod: **`shared/_tests/faProjectContentSchemas.vitest.test.ts`**

Vitest uses **mock** `better-sqlite3` databases in unit tests (native ABI is validated via production Electron builds, not in **`unit-electron`**).
