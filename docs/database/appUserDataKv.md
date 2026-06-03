# App `userData` persistence (not `.faproject`)

Fantasia Archive also persists data outside project SQLite files. These stores live under the Electron **`userData`** directory (see **`app.getPath('userData')`** in main). They use **`electron-store`** (JSON files), not **`better-sqlite3`**.

Do **not** document these keys in [projectDB.md](projectDB.md). Use this file when changing app-wide persistence.

## Store files (electron-store `name`)

| Store name | File (typical) | Module | IPC group |
|------------|----------------|--------|-----------|
| **`faUserSettings`** | `faUserSettings.json` | **`src-electron/mainScripts/userSettings/userSettings_manager.ts`** | **`FA_USER_SETTINGS_IPC`** |
| **`faKeybinds`** | `faKeybinds.json` | **`src-electron/mainScripts/keybinds/keybinds_manager.ts`** | **`FA_KEYBINDS_IPC`** |
| **`faAppStyling`** | `faAppStyling.json` | **`src-electron/mainScripts/appStyling/appStyling_manager.ts`** | **`FA_APP_STYLING_IPC`** |
| **`faAppNoteboard`** | `faAppNoteboard.json` | **`src-electron/mainScripts/appNoteboard/appNoteboard_manager.ts`** | **`FA_APP_NOTEBOARD_IPC`** |
| **`faRecentProjectList`** | `faRecentProjectList.json` | **`src-electron/mainScripts/projectManagement/faRecentProjectListRuntimeWiring.ts`** | **`FA_PROJECT_MANAGEMENT_IPC`** (recent list APIs) |

Defaults and cleanup helpers live beside each manager (`*_managerDefaults.ts`, `functions/*StoreApi.ts`, `functions/*StoreCleanup.ts`).

## App configuration import (`.faconfig`)

Bundled settings import/export uses **`src-electron/mainScripts/appConfig/`** and **`FA_APP_CONFIG_IPC`**. Staged import applies into the **`electron-store`** domains above (not into an open **`.faproject`** unless the flow explicitly touches project IPC).

## Playwright isolated profile

When **`TEST_ENV`** is set, main may redirect **`userData`** to an isolated folder (see **`src-electron/mainScripts/appIdentity/`** and **README** Playwright notes). Store file names are unchanged; only the directory path differs.

## Related

- [projectDB.md](projectDB.md) — per-project SQLite
- [README.md](../../README.md) — **Native modules** and project open flow
- `.cursor/skills/fantasia-electron-preload/SKILL.md` — adding bridge APIs
