# Database documentation (Fantasia Archive)

Canonical ref: **where data lives** + **how accessed** in Electron desktop app. Update same commit as schema, persistence, or IPC changes on described surfaces.

## Files

| File | Scope |
|------|--------|
| [projectDB.md](projectDB.md) | Active **`.faproject`** SQLite: `PRAGMA user_version` (max **1**, flattened pre-release), `project_data` KV, content tables, migration entry, main-process modules, **`FA_PROJECT_CONTENT_IPC`**, **Project Settings** worlds snapshot save (per-world template layout) |
| [templateCustomFields.md](templateCustomFields.md) | **Approved design** (not SQLite yet): document template field defs, document values, orphan policy, implementation route |
| [appUserDataKv.md](appUserDataKv.md) | **Not** project SQLite: **`electron-store`** JSON under app **`userData`** (user settings, keybinds, MRU, app-wide styling/noteboard) |

## Quick rules for agents

- **Open project file** → [projectDB.md](projectDB.md); route active-project access via **`runWithFaProjectDatabaseForIpcAsync`** / **`runWithFaProjectDatabaseSync`** (**`.cursor/rules/fa-project-database-access.mdc`**).
- **Template custom fields** → [templateCustomFields.md](templateCustomFields.md) first; schema ships → update [projectDB.md](projectDB.md) same commit.
- **Renderer bridge** → **`window.faContentBridgeAPIs.projectManagement`** (lifecycle, settings, styling, noteboard), **`window.faContentBridgeAPIs.projectContent`** (worlds, documents, templates, media, links). Channels: **`src-electron/electron-ipc-bridge.ts`**.
- UI **markdown documents** (help, **`T_documentName`**) ≠ SQLite **`documents`** table — see [projectDB.md](projectDB.md) naming note.
- **No** **`electron-store`** in `projectDB.md` — use [appUserDataKv.md](appUserDataKv.md).

## Related project docs

- [AGENTS.md](../../AGENTS.md) — stack, IPC, testing
- [README.md](../../README.md) — **Native modules (better-sqlite3)**, project settings refresh contract
- `.cursor/skills/fantasia-sqlite-main/SKILL.md` — main-process SQLite playbook
- `.cursor/skills/fantasia-flatten-database-schemas/SKILL.md` — pre-release squash **`user_version`** ladders (dev resets only)
