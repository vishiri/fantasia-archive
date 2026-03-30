# Changelog
----------

## 2.2.0 - Testing and agent tooling

### New features
- Expanded Vitest coverage for Electron preload bridge modules and main-process scripts (window controls, devtools, external links, app management, spell checker, and main window creation) using deterministic mocks.
- Playwright component tests for DialogAboutFantasiaArchive (replaces the previous TODO placeholder file).
- Cursor rule and skill for local plan documents in `.cursor/plans/` (gitignored), plus changelog guidance to read version-matching plan files for release context.

### Bugfixes & Optimizations
- Replaced remaining TypeScript `any` annotations in shared type declarations with `unknown` to keep menu trigger and Vue component typing stricter.
- Added explicit anti-`any` guidance to Vue, TypeScript scripts, Vitest, and Playwright rules/skills to keep future code strongly typed.

## 2.1.0 - Tooling and AI-assisted development

### New features
- Cursor project rules and skills for Vue/Quasar, BEM and scoped SCSS, Playwright and Vitest, Electron preload, global SCSS, conventional Git commits, and en-US changelog upkeep tied to the app version.
- AGENTS.md as the project entry point for AI-assisted development.

## 2.0.0 - The Big Rewrite

### New features
- A whole plethora since this is a full rewrite!

### Known issues
- No issues at the date of release.

### Bugfixes & Optimizations
- Too many optimizations to list since this is a rewrite.
- No bugs at the date of release.
