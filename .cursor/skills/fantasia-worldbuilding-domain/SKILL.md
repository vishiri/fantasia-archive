---
name: fantasia-worldbuilding-domain
description: >-
  Aligns AI suggestions with Fantasia Archive as a worldbuilding database
  manager: projects, documents, and in-app concepts. Use when designing UX,
  data models, menus, or copy that should match the product purpose.
---

# Fantasia Archive — product domain

## What the app is

- **Fantasia Archive** — worldbuilding database manager (GPL-3.0)
- Users organize fictional worlds as **projects** and **documents** (+ search, tree, noteboard, settings — **`AppControlMenus/_data/`**)
- **Floating `Window*`** (e.g. **App styling**) = app chrome for theme/CSS — not in-universe lore. See [AGENTS.md](../../../AGENTS.md) **In-renderer floating windows**

## Vocabulary (prefer in UI and models)

- **Project**: worldbuilding dataset container (new/save/load/export)
- **Document**: content unit in **`.faproject`** **`documents`** table — not i18n help/license markdown
- **Template**: form schema via **`template_id`**; v4 = display name on **`document_templates`**; custom fields in [templateCustomFields.md](../../docs/database/templateCustomFields.md)
- **Custom field**: typed template slot with stable **`field_id`**; document values keyed by id, merged at read
- **Tools / settings**: app behavior — distinct from in-universe lore unless intentionally meta

## License

**GPL-3.0** — respect for third-party integration and distribution.

## Implementation note

Many menu items still **`trigger: undefined`** / TODO — keep terminology consistent with domain + existing i18n keys.

## Types

Shared types → **`types/`**. See [types-folder.mdc](../../rules/types-folder.mdc).
