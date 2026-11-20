# String Theory: Return to Lumen — Fantasia Archive project

A ready-to-open Fantasia Archive project for the *Lumen* worldbuilding set, plus the script
that regenerates it.

## Files

| File | What it is |
|---|---|
| `lumen.faproject` | SQLite project, schema `user_version = 11`, openable in Fantasia Archive |
| `lumen-world.json` | Declarative source: world, groups, templates, placements, documents, tags |
| `build_project_db.py` | Rebuilds `lumen.faproject` from the JSON. `python3 build_project_db.py` |
| `documents/<ID>.md` | Prose body for each document, one file per id |

## How it is structured

Six top-level groups, each holding the document templates that belong to it. This mirrors the
portal layout of the source wiki.

| Group | Templates |
|---|---|
| 世界 | 世界规则 · 纪元 · 地点 · 材料 |
| 生命 | 生命 |
| 文明 | 社会 · 技术 · 器物 |
| 人物 | 人物 |
| 故事 | 故事结构 · 主题 |
| 术语 | 概念 · 事件 |

Under each placement sit the documents. A document nests under its parent when both share a
template, so sub-entries about one character appear beneath that character rather than at the
top level: 88 of the 273 documents have a parent.

Documents whose children exist are marked `is_category = 1` (33 of them).

Status is carried on tags, one tag per state: `CANON` 180, `PROPOSED` 72, `TBD` 11,
`DEPRECATED` 6, `CONFLICT` 4. `is_finished` is set for `CANON` rows.

## A limitation worth knowing

The project schema at version 11 stores no document body. A `documents` row is a named node
with a template, a hierarchy position, colours and flags, and nothing else. There is no
column for prose in `faProjectDbSchemaDdl.ts`.

The actual text therefore lives beside the database, one markdown file per document id, named
`documents/<ID>.md`. Anything that later adds a body column, or an importer, can join on the
file name.

## Rebinding

`lumen-world.json` is generated from the source wiki's `metadata/entities.json`. If entries
change upstream, regenerate the JSON and re-run `build_project_db.py`, then replace the
`.faproject`.
