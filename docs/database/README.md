# Database documentation (Fantasia Archive)

This folder is the canonical reference for **where data lives** and **how it is accessed** in the Electron desktop app. Update these files in the **same commit** as schema, persistence, or IPC changes that affect the described surfaces.

## Files

| File | Scope |
|------|--------|
| [projectDB.md](projectDB.md) | Active **`.faproject`** SQLite files: `PRAGMA user_version`, `project_data` KV, v4 content tables, migrations, main-process modules, and **`FA_PROJECT_CONTENT_IPC`** |
| [appUserDataKv.md](appUserDataKv.md) | **Not** project SQLite: **`electron-store`** JSON under the app **`userData`** directory (user settings, keybinds, MRU, app-wide styling/noteboard) |

## Quick rules for agents

- **Open project file work** → read [projectDB.md](projectDB.md); route active-project access through **`runWithFaProjectDatabaseForIpcAsync`** / **`runWithFaProjectDatabaseSync`** (see **`.cursor/rules/fa-project-database-access.mdc`**).
- **Renderer bridge** → **`window.faContentBridgeAPIs.projectManagement`** (lifecycle, settings, styling, noteboard) and **`window.faContentBridgeAPIs.projectContent`** (worlds, documents, templates, media, links). Channel names live in **`src-electron/electron-ipc-bridge.ts`**.
- **UI “markdown documents”** (help dialogs, **`T_documentName`**) are **unrelated** to the SQLite **`documents`** table — see the naming note in [projectDB.md](projectDB.md).
- **Do not** mix **`electron-store`** persistence into `projectDB.md`; use [appUserDataKv.md](appUserDataKv.md).

## Related project docs

- [AGENTS.md](../../AGENTS.md) — stack, IPC, testing
- [README.md](../../README.md) — **Native modules (better-sqlite3)** and project settings refresh contract
- `.cursor/skills/fantasia-sqlite-main/SKILL.md` — main-process SQLite playbook
