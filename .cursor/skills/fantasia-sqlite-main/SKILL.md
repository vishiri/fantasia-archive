---
name: fantasia-sqlite-main
description: >-
  Designs SQLite usage in Fantasia Archive’s Electron main process: file
  locations under userData, native better-sqlite3 module constraints, and migrations.
  Use when editing electron-main database code, schema, or persistence paths.
---

# Fantasia Archive — SQLite in main process

## Canonical schema documentation

- **[docs/database/projectDB.md](../../docs/database/projectDB.md)** — **`.faproject`** `user_version` (supported max **5** today), tables, IPC, Project Settings
- **[docs/database/templateCustomFields.md](../../docs/database/templateCustomFields.md)** — planned custom fields (not shipped)
- **[docs/database/appUserDataKv.md](../../docs/database/appUserDataKv.md)** — **`electron-store`** in **`userData`**
- **[docs/database/README.md](../../docs/database/README.md)** — index

Schema/IPC changes → update docs same commit ([docs-database.mdc](../../rules/docs-database.mdc)).

## Current state

- **`better-sqlite3`** — main process only
- **`.faproject`** SQLite under **`src-electron/mainScripts/projectManagement/`**; renderer via **`window.faContentBridgeAPIs.projectManagement`**
- **E2E paths**: **`e2eSetNextProjectCreatePath`** / **`e2eSetNextProjectOpenPath`** in **`playwrightE2eProjectPaths.ts`**
- **`user_version` 5** max today — worlds, documents, templates, media, junctions; Project Settings snapshots via **`saveWorldsSnapshot`**, **`saveDocumentTemplatesSnapshot`**
- **Pre-release flatten**: [fantasia-flatten-database-schemas](../fantasia-flatten-database-schemas/SKILL.md)

## Principles

1. **No arbitrary SQL from renderer** — narrow validated preload APIs + IPC ([fantasia-electron-preload](../fantasia-electron-preload/SKILL.md))
2. **Paths**: **`app.getPath('userData')`**; mkdir before open
3. **Native builds**: verify **`yarn quasar:build:electron`** after upgrades
4. **Lifecycle**: deliberate open/close; no leaked handles on dev reload

## Active project DB access (mandatory failsafe)

All active **`.faproject`** reads/writes → **`runWithFaProjectDatabaseForIpcAsync`** / **`runWithFaProjectDatabaseSync`** from **`faProjectDatabaseEnsureConnected.ts`**. ESLint restricts direct **`getFaProjectActiveDatabase`** imports ([fa-project-database-access.mdc](../../rules/fa-project-database-access.mdc)).

### Project settings refresh contract (renderer)

Unlike App Settings (Pinia seed on open), **Project Settings** always reads SQLite on open:

1. **Open**: **`getProjectSettings`** + **`listWorldsForProjectSettings`**
2. **Edit**: local draft until Save
3. **Save**: **`saveProjectSettings`** → KV patch + optional **`saveWorldsSnapshot`**
4. **Errors**: throw → action manager toast
5. **Main**: **`runWithFaProjectDatabaseForIpcAsync`** only

Extend **`propagateFaProjectSettingsToAppConsumers`** when new fields need live UI after save. See **projectDB.md** **Project Settings (renderer ↔ SQLite)**.

- **Mirrored path**: **`faProjectActiveDatabase.ts`** — **`replaceFaProjectActiveDatabase`**, **`closeFaProjectActiveDatabase`**, handle-only close for reconnect
- **Reconnect + retry**: one sync reopen + one handle-only retry on classified SQLite errors; single-flight mutex
- **Optional renderer path**: **`FA_PROJECT_FAILSAFE_IPC`** when main has no mirrored path
- **Session reset**: **`did-start-navigation`** main frame, not same-document — **`faMainWindowWebContentsSessionReset.ts`**

New project-DB IPC → ensure layer + tests under **`projectManagement/_tests/`**.

## Evolution

- Dedicated module under **`mainScripts/`** when replacing stubs; keep **`electron-main.ts`** thin
- Migrations/backup aligned with worldbuilding model — [fantasia-worldbuilding-domain](../fantasia-worldbuilding-domain/SKILL.md)

## Types

Shared types → **`types/`**. See [types-folder.mdc](../../rules/types-folder.mdc).
