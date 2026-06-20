---
name: fantasia-plan-documents
description: >-
  Creates and updates local plan documents in .cursor/plans with required
  timestamp and package version metadata in both file body and filename.
  Before saving a new plan, deletes existing plan files whose last modified
  time is more than 30 days old.
---

# Plan documents (`.cursor/plans`)

## Scope

Planning artifacts: rollout inventories, checklists, migration trackers, etc.

## Prune stale plans before saving

- List **`.cursor/plans/`** before new plan
- Delete files with mtime **>30 days** old
- Skip if folder missing/empty

## Required location

- **`.cursor/plans/`** — create if missing
- No top-level **`docs/`** for plans unless user requests elsewhere

## Required filename format

Topic + version + timestamp **`YYYY-MM-DD-HH-mm-ss`**.

Example: `feature-x-plan_v2.1.0_2026-03-30-20-10-39.plan.md`

## Required in-file metadata

- `Created at: YYYY-MM-DD-HH-mm-ss`
- `Project version: <package.json version>`

## Version source

Read **`package.json`** — same value in filename + body.

## Notes

- Local temporary workspace; may be gitignored
- Drafts elsewhere → move into **`.cursor/plans/`** + normalize metadata

## Types

Shared types → **`types/`**. See [types-folder.mdc](../../rules/types-folder.mdc).
