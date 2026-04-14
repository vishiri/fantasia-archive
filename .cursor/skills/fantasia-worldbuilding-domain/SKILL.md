---
name: fantasia-worldbuilding-domain
description: >-
  Aligns AI suggestions with Fantasia Archive as a worldbuilding database
  manager: projects, documents, and in-app concepts. Use when designing UX,
  data models, menus, or copy that should match the product purpose.
---

# Fantasia Archive — product domain

## What the app is

- **Fantasia Archive** is a **worldbuilding database manager** (see `package.json` / README).
- Users organize fictional worlds as **projects** and **documents** (and related tooling: search, tree, note board, settings — see menu data under `src/components/globals/AppControlMenus/_data/`).

## Vocabulary (prefer in UI and models)

- **Project**: A container for a worldbuilding dataset (new / save / load / export flows in menus).
- **Document**: A unit of content in the database (quick add, search, mass delete, etc.).
- **Tools / settings**: Application behavior, not “the world” itself — keep naming distinct from in-universe lore terms unless intentionally meta.

## License

- Project is **GPL-3.0**; third-party integration and distribution should respect that.

## Implementation note

- Many menu items are present with `trigger: undefined` / TODOs — when implementing features, keep terminology consistent with the domain above and existing i18n keys.

## TypeScript interfaces and types (`types/`)

- Put shared `interface` / `type` declarations in repository-root `types/` (import with `app/types/...`). Prefer one domain-oriented module per feature area with brief JSDoc on exports (see `types/I_appMenusDataList.ts`). Do not add colocated `<filename>.types.ts` under `src/`, `src-electron/`, or `.storybook-workspace/`. Ambient augmentations for third-party modules also live under `types/` and are loaded with a side-effect import from the owning boot file or `src/stores/index.ts` (see `types/piniaModuleAugmentation.ts`).
- For JavaScript (`.js`), TypeScript (`.ts`), Vue (`.vue`), and JSON (`.json`, `.jsonc`, `.json5`) files, enforce expanded multi-line object literals via ESLint (`object-curly-newline` + `object-property-newline`) and keep files auto-fixable with `eslint --fix`.
