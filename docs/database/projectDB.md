# `.faproject` SQLite schema and APIs

Each user project is a single SQLite database file with the **`.faproject`** extension. The main process opens it with **`better-sqlite3`**, applies migrations, and serves the renderer through preload IPC. This document is the canonical schema and module map.

## Naming: `documents` table vs UI markdown documents

The SQLite table **`documents`** stores **worldbuilding document entities** (rows tied to a **world** and optional **template**). It is **not** the same as in-app help or license **markdown** loaded from **`i18n/.../documents/*.md`** or **`T_documentName`** dialog routing. When adding features, keep SQL/table copy separate from markdown dialog naming.

## Schema version (`PRAGMA user_version`)

| Version | Contents |
|---------|----------|
| **0** | New file bootstrap: creates **`project_data`**, seeds metadata, then applies **v4** content DDL (see below). Ends at **4**. |
| **1** | Legacy **`project_options`** table; migration may insert **`project_uuid`**. |
| **2** | Renames **`project_options`** → **`project_data`**, sets version **3**. |
| **3** | KV-only project file (settings, styling, noteboard keys). |
| **4** | Adds worldbuilding **content tables** (current max). |

**Supported max:** **`FA_PROJECT_USER_VERSION_SUPPORTED_MAX = 4`** in **`faProjectDbMigrateWiring.ts`**.

**Migration entry:** **`applyFaProjectMigrations(db, displayProjectName)`** — fresh files start at **0** and land on **4** in one transaction; legacy **1/2** paths run the rename ladder then a separate **3→4** step; files already at **3** skip legacy work and only run **v3→4** content DDL.

**DDL source:** **`src-electron/mainScripts/projectManagement/functions/faProjectDbSchemaDdl.ts`** (`applyFaProjectContentSchemaV4`).

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

## Version 4 content tables

Primary keys are **TEXT UUID v4** on entity tables. Timestamps are **`created_at_ms`** / **`updated_at_ms`** (Unix ms).

### `worlds`

| Column | Type | Notes |
|--------|------|--------|
| `id` | TEXT PK | UUID |
| `display_name` | TEXT | Non-empty |
| `created_at_ms`, `updated_at_ms` | INTEGER | |

### `document_templates`

Same shape as **`worlds`** (id, display_name, timestamps).

### `media`

Same shape as **`worlds`**.

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

### `world_media` (M:N)

| Column | Notes |
|--------|--------|
| `world_id` | FK → `worlds.id` **ON DELETE CASCADE** |
| `media_id` | FK → `media.id` **ON DELETE CASCADE** |
| PRIMARY KEY (`world_id`, `media_id`) | |

### `document_media` (M:N)

| Column | Notes |
|--------|--------|
| `document_id` | FK → `documents.id` **ON DELETE CASCADE** |
| `media_id` | FK → `media.id` **ON DELETE CASCADE** |
| PRIMARY KEY (`document_id`, `media_id`) | |

Indexes: **`idx_documents_world_id`**, **`idx_documents_template_id`**, **`idx_world_media_media_id`**, **`idx_document_media_media_id`**.

## Relationships (summary)

| Relationship | Implementation |
|--------------|----------------|
| World → documents | `documents.world_id` |
| Document → template | `documents.template_id` (nullable) |
| World ↔ media | `world_media` |
| Document ↔ media | `document_media` |

**Link helpers (FK assignment):** **`setFaProjectDocumentWorld`**, **`setFaProjectDocumentTemplate`** in **`faProjectDocumentsPersistWiring.ts`**.

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
    faProjectDbSchemaDdl.ts             # v4 DDL
    faProjectContentRowMap.ts           # row → DTO mappers
  projectDbContent/
    faProjectContentNamedEntitySqlWiring.ts
    faProjectWorldsPersistWiring.ts
    faProjectDocumentsPersistWiring.ts
    faProjectDocumentTemplatesPersistWiring.ts
    faProjectMediaPersistWiring.ts
    faProjectWorldMediaLinksWiring.ts
    faProjectDocumentMediaLinksWiring.ts
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
| `link-world-media-async` | `linkFaProjectWorldMedia` |
| `unlink-world-media-async` | `unlinkFaProjectWorldMedia` |
| `list-media-for-world-async` | `listFaProjectMediaForWorld` |
| `link-document-media-async` | `linkFaProjectDocumentMedia` |
| `unlink-document-media-async` | `unlinkFaProjectDocumentMedia` |
| `list-document-media-async` | `listFaProjectMediaForDocument` |

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
