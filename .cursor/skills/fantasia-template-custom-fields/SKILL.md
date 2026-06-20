---
name: fantasia-template-custom-fields
description: >-
  Document template custom fields: field definitions, document values, merge-at-read,
  orphan retention, and template editor flows. Use when designing or implementing
  template fields, document forms, related SQLite schema, or projectContent IPC.
---

# Document template custom fields

## Canonical documentation

- **Design (not yet in v4 schema):** [docs/database/templateCustomFields.md](../../docs/database/templateCustomFields.md)
- **Shipped schema:** [docs/database/projectDB.md](../../docs/database/projectDB.md) — same commit when migrations/IPC land
- **Index:** [docs/database/README.md](../../docs/database/README.md)

## Related skills

- [fantasia-worldbuilding-domain](../fantasia-worldbuilding-domain/SKILL.md)
- [fantasia-sqlite-main](../fantasia-sqlite-main/SKILL.md)
- [fantasia-electron-preload](../fantasia-electron-preload/SKILL.md)
- [fantasia-action-manager](../fantasia-action-manager/SKILL.md)

## Rule

[fa-template-custom-fields.mdc](../../rules/fa-template-custom-fields.mdc) when touching design or implementation.

## Design summary

- **Template shell** — existing **`document_templates`**
- **Field definitions** — planned **`template_fields`** (UUID **`field_id`**, soft-delete, sort, type, config)
- **Document values** — planned **`document_field_values`** + field-scoped link tables
- **Orphans** — values for inactive/removed defs stay in DB; UI shows active fields only
- **Read** — active defs + all values; bind by **`field_id`**
- **Save** — validate active defs; upsert; never auto-delete orphans

## Implementation phases (short)

1. Schema v5+ — DDL + migrate wiring → **projectDB.md**
2. Main persist — **`projectDbContent/*`**
3. Zod — **`src-electron/shared/faProjectTemplateField*`**, **`faProjectDocumentField*`**
4. IPC + preload — bridge + **`projectContentAPI.ts`**
5. Types — **`types/I_faProject*Domain.ts`**
6. Renderer — Pinia, document editor merge/save
7. Template editor UI — field CRUD, type-change guards
8. Deferred — orphan recovery UI, cross-field search, version pins

## Do not

- Hard-delete document values when field removed from template
- Key values by label/slug/sort order — **`field_id`** only
- Silently change field type + coerce values
- Ship template versioning / per-document version pins in v1
- Store custom field data in **`electron-store`** or **`project_data`** KV

## Types

Shared types → **`types/`**. See [types-folder.mdc](../../rules/types-folder.mdc).
