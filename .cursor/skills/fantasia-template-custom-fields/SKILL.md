---
name: fantasia-template-custom-fields
description: >-
  Document template custom fields: field definitions, document values, merge-at-read,
  orphan retention, and template editor flows. Use when designing or implementing
  template fields, document forms, related SQLite schema, or projectContent IPC.
---

# Document template custom fields

## Canonical documentation

- **Approved design (not yet in v4 schema):** [docs/database/templateCustomFields.md](../../docs/database/templateCustomFields.md)
- **Shipped schema:** [docs/database/projectDB.md](../../docs/database/projectDB.md) — update in the same commit when migrations or IPC land ([docs-database.mdc](../../rules/docs-database.mdc))
- **Index:** [docs/database/README.md](../../docs/database/README.md)

## Related skills

- [fantasia-worldbuilding-domain](../fantasia-worldbuilding-domain/SKILL.md) — Template, Document, Custom field vocabulary
- [fantasia-sqlite-main](../fantasia-sqlite-main/SKILL.md) — migrations, `runWithFaProjectDatabase*`, `projectDbContent/`
- [fantasia-electron-preload](../fantasia-electron-preload/SKILL.md) — extend `FA_PROJECT_CONTENT_IPC` and `projectContentAPI.ts`
- [fantasia-action-manager](../fantasia-action-manager/SKILL.md) — document save failures and unified toasts

## Rule

Follow [fa-template-custom-fields.mdc](../../rules/fa-template-custom-fields.mdc) when touching design or implementation paths.

## Design summary

- **Template shell** — existing `document_templates` (v4 name-only row).
- **Field definitions** — planned `template_fields` with stable UUID `field_id`, soft-delete, sort order, type, config.
- **Document values** — planned `document_field_values` (typed scalars) and field-scoped link tables (M:N).
- **Orphans** — values for inactive or removed field defs stay in DB; main form shows active fields only.
- **Read path** — load active defs + all values; bind by `field_id`.
- **Save path** — validate active defs; upsert payload; never auto-delete orphans.

## Implementation phases (short)

1. Schema v5+ — `faProjectDbSchemaDdl.ts`, `faProjectDbMigrateWiring.ts` → update `projectDB.md`
2. Main persist — new `projectDbContent/*` wiring modules
3. Zod — `src-electron/shared/faProjectTemplateField*`, `faProjectDocumentField*`
4. IPC + preload — `electron-ipc-bridge.ts`, `registerFaProjectContentIpcHandlersWiring.ts`, `projectContentAPI.ts`
5. Types — `types/I_faProject*Domain.ts`
6. Renderer — Pinia, document editor merge/save
7. Template editor UI — field CRUD, type-change guards
8. Deferred — orphan recovery UI, cross-field search, version pins

## Do not

- Hard-delete document values when a field is removed from a template.
- Key values by field label, slug, or sort order (use `field_id` only).
- Silently change field type and coerce existing values.
- Ship template versioning or per-document version pins in v1.
- Store custom field data in `electron-store` or `project_data` KV — project content belongs in content tables.

## TypeScript interfaces and types (`types/`)

- Put shared `interface` / `type` declarations in repository-root `types/` (import with `app/types/...`). Prefer one domain-oriented module per feature area with brief JSDoc on exports (see `types/I_appMenusDataList.ts`). Do not add colocated `<filename>.types.ts` under `src/`, `src-electron/`, or `.storybook-workspace/`. Ambient augmentations for third-party modules also live under `types/` and are loaded with a side-effect import from the owning boot file or `src/stores/index.ts` (see `types/piniaModuleAugmentation.ts`).
- For JavaScript (`.js`), TypeScript (`.ts`), Vue (`.vue`), and JSON (`.json`, `.jsonc`, `.json5`) files, enforce expanded multi-line object literals via ESLint (`object-curly-newline` + `object-property-newline`) and keep files auto-fixable with `eslint --fix`.
