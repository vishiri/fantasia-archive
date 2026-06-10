---
name: fantasia-flatten-database-schemas
description: >-
  Collapses .faproject SQLite PRAGMA user_version ladders into a single
  bootstrap schema (currently version 1) during pre-release dev resets. Use when
  the user asks to flatten database schemas, reset migrations, or squash schema
  versions before wider release.
---

# Flatten database schemas (`.faproject`)

## When to use

- Pre-release / dev-only resets when incremental migrations are not worth keeping.
- User explicitly asks to **flatten** schema versions or **squash** migrations.
- **Do not** flatten after public release without a deliberate migration strategy for user data.

## Current baseline (after flatten)

- **`PRAGMA user_version` 1** is the only shipped schema revision.
- **`FA_PROJECT_USER_VERSION_SUPPORTED_MAX = 1`** in **`faProjectDbMigrateWiring.ts`**.
- Fresh files: **`user_version` 0** → bootstrap transaction → **`user_version` 1** + default world seed.
- Files already at **1**: **`applyFaProjectMigrations`** returns immediately.
- Any other version: **unsupported** (throws **Unexpected project file schema state** or **newer version** when above max).

## Flatten procedure (checklist)

1. **Read** [docs/database/projectDB.md](../../docs/database/projectDB.md) and list every table/column/index the product must keep.
2. **Merge DDL** into **`src-electron/mainScripts/projectManagement/functions/faProjectDbSchemaDdl.ts`**:
   - **`applyFaProjectProjectDataSchemaV1`** — **`project_data`** KV table.
   - **`applyFaProjectContentSchemaV1`** — all content tables with **final** column definitions (no separate ALTER steps).
3. **Simplify** **`faProjectDbMigrateWiring.ts`**:
   - Set **`FA_PROJECT_USER_VERSION_SUPPORTED_MAX`** to **1** (or the new single version).
   - Remove legacy migration steps and incremental **`migrateProjectDataV*ToV*`** helpers.
   - Keep **`applyFaProjectMigrations(db, displayProjectName)`** as the entry point.
   - Preserve bootstrap side effects still required (metadata rows, **`seedFaProjectDefaultWorldIfEmpty`**, post-bootstrap verification).
4. **Delete** migration-only helpers (backfills, rename ladders, legacy table names) that no longer apply.
5. **Tests** — rewrite **`_tests/faProjectDbMigrate.vitest.test.ts`** for bootstrap + no-op + error paths only; update **`faProjectDbSchemaDdl.vitest.test.ts`** for consolidated DDL.
6. **Docs** — [projectDB.md](../../docs/database/projectDB.md), [templateCustomFields.md](../../docs/database/templateCustomFields.md) version notes, [AGENTS.md](../../AGENTS.md), [README.md](../../README.md) if schema summary is mentioned.
7. **Changelog** — user-visible note that older dev **`.faproject`** files must be recreated (under current **`package.json`** version only).
8. **Quality gate** — **`yarn testbatch:verify`**.

## Adding migrations again (after flatten)

When the schema grows:

1. Bump **`FA_PROJECT_USER_VERSION_SUPPORTED_MAX`** (e.g. **1 → 2**).
2. Add **`applyFaProjectContentSchemaV2`** or **`migrateProjectDataV1ToV2`** with **`ALTER TABLE`** / new tables.
3. Chain in **`applyFaProjectMigrations`**: if **`readUserVersion(db) === 1`**, run the v1→v2 transaction and set **`user_version = 2`**.
4. Update **`projectDB.md`** version table and tests for the new step.

Do **not** reintroduce a long historical ladder unless shipping upgrades to real users requires it.

## Related

- [fantasia-sqlite-main](../fantasia-sqlite-main/SKILL.md) — ongoing SQLite work and ensure-connected access
- [docs-database.mdc](../../rules/docs-database.mdc) — doc sync on schema changes
- [flatten-database-schemas.mdc](../../rules/flatten-database-schemas.mdc) — rule pointer for agents

## TypeScript interfaces and types (`types/`)

- Put shared `interface` / `type` declarations in repository-root `types/` (import with `app/types/...`). Prefer one domain-oriented module per feature area with brief JSDoc on exports (see `types/I_appMenusDataList.ts`). Do not add colocated `<filename>.types.ts` under `src/`, `src-electron/`, or `.storybook-workspace/`. Ambient augmentations for third-party modules also live under `types/` and are loaded with a side-effect import from the owning boot file or `src/stores/index.ts` (see `types/piniaModuleAugmentation.ts`).
- For JavaScript (`.js`), TypeScript (`.ts`), Vue (`.vue`), and JSON (`.json`, `.jsonc`, `.json5`) files, enforce expanded multi-line object literals via ESLint (`object-curly-newline` + `object-property-newline`) and keep files auto-fixable with `eslint --fix`.
