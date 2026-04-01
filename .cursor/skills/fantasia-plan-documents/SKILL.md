---
name: fantasia-plan-documents
description: >-
  Creates and updates local plan documents in .cursor/plans with required
  timestamp and package version metadata in both file body and filename.
---

# Plan documents (`.cursor/plans`)

## Scope

Use this skill whenever creating or updating a planning document.
This includes rollout inventories, implementation checklists, migration trackers, and other planning artifacts.

## Required location

- Store plans in `.cursor/plans/`.
- If the folder does not exist, create it.
- Do not create top-level `docs/` (or other new documentation roots) for planning artifacts unless the user explicitly requests a different location.

## Required filename format

- Include the base topic, current version, and timestamp.
- Timestamp format: `YYYY-MM-DD-HH-mm-ss`.
- Example: `feature-x-plan_v2.1.0_2026-03-30-20-10-39.plan.md`

## Required in-file metadata

At the top of each plan document, include:

- `Created at: YYYY-MM-DD-HH-mm-ss`
- `Project version: <package.json version>`

## Version source

- Read version from `package.json`.
- Use that exact value in both filename and file body metadata.

## Notes

- `.cursor/plans` is a local temporary workspace and may be gitignored.
- If a planning artifact is initially drafted elsewhere, move it into `.cursor/plans/` and normalize filename/body metadata to this skill's format.
