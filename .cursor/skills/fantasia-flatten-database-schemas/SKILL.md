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

- Pre-release / dev-only resets when incremental migrations not worth keeping
- User explicitly asks to **flatten** or **squash** migrations
- **Do not** flatten after public release without migration strategy for user data

## Current baseline (after flatten)

- **`PRAGMA user_version` 1** only shipped revision
- **`FA_PROJECT_USER_VERSION_SUPPORTED_MAX = 1`** in **`faProjectDbMigrateWiring.ts`**
- Fresh: **0** → bootstrap → **1** + default world seed
- At **1**: **`applyFaProjectMigrations`** no-op
- Other versions: unsupported (throws)

## Flatten procedure (checklist)

1. Read [docs/database/projectDB.md](../../docs/database/projectDB.md); list tables/columns/indexes to keep
2. Merge DDL into **`faProjectDbSchemaDdl.ts`** (**`applyFaProjectProjectDataSchemaV1`**, **`applyFaProjectContentSchemaV1`**)
3. Simplify **`faProjectDbMigrateWiring.ts`** — max version **1**, remove legacy steps
4. Delete obsolete migration-only helpers
5. Rewrite **`_tests/faProjectDbMigrate.vitest.test.ts`**; update DDL tests
6. Docs: **projectDB.md**, **templateCustomFields.md**, **AGENTS.md**, **README.md** if needed
7. Changelog: older dev **`.faproject`** must be recreated (current **`package.json`** version only)
8. **Full** **`yarn testbatch:verify`** before commit (schema squash touches electron + docs + broad tests)

## Adding migrations again (after flatten)

1. Bump **`FA_PROJECT_USER_VERSION_SUPPORTED_MAX`**
2. Add **`applyFaProjectContentSchemaV2`** or **`migrateProjectDataV1ToV2`**
3. Chain in **`applyFaProjectMigrations`**
4. Update **projectDB.md** + tests

No long historical ladder unless real user upgrades require it.

## Related

- [fantasia-sqlite-main](../fantasia-sqlite-main/SKILL.md)
- [docs-database.mdc](../../rules/docs-database.mdc)
- [flatten-database-schemas.mdc](../../rules/flatten-database-schemas.mdc)

## Types

Shared types → **`types/`**. See [types-folder.mdc](../../rules/types-folder.mdc).
