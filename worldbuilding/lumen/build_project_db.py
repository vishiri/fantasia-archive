#!/usr/bin/env python3
"""Build a Fantasia Archive 1.x .faproject (SQLite) from lumen-world.json.

Schema mirrors src-electron/mainScripts/projectManagement/functions/faProjectDbSchemaDdl.ts
at FA_PROJECT_USER_VERSION_SUPPORTED_MAX = 11.
"""
import json, os, sqlite3, time, uuid, sys

HERE = os.path.dirname(os.path.abspath(__file__))
MANIFEST = os.path.join(HERE, "lumen-world.json")
OUT_DB = os.path.join(HERE, "lumen.faproject")
SCHEMA_VERSION = 11

DDL = """
CREATE TABLE IF NOT EXISTS project_data (
  option_id INTEGER PRIMARY KEY,
  option_name TEXT NOT NULL UNIQUE CHECK (length(option_name) BETWEEN 1 AND 255),
  option_value TEXT NOT NULL);

CREATE TABLE IF NOT EXISTS worlds (
  id TEXT NOT NULL PRIMARY KEY,
  display_name TEXT NOT NULL CHECK (length(display_name) > 0),
  display_name_translations_json TEXT NOT NULL DEFAULT '{}',
  color TEXT NOT NULL DEFAULT '',
  color_palette TEXT NOT NULL DEFAULT '{}',
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at_ms INTEGER NOT NULL,
  updated_at_ms INTEGER NOT NULL);

CREATE TABLE IF NOT EXISTS document_templates (
  id TEXT NOT NULL PRIMARY KEY,
  display_name TEXT NOT NULL CHECK (length(display_name) > 0),
  title_translations_json TEXT NOT NULL DEFAULT '{}',
  title_singular_translations_json TEXT NOT NULL DEFAULT '{}',
  sort_order INTEGER NOT NULL DEFAULT 0,
  world_appendix TEXT NOT NULL DEFAULT '',
  world_appendix_translations_json TEXT NOT NULL DEFAULT '{}',
  icon TEXT NOT NULL DEFAULT '',
  created_at_ms INTEGER NOT NULL,
  updated_at_ms INTEGER NOT NULL);

CREATE TABLE IF NOT EXISTS world_template_groups (
  id TEXT NOT NULL PRIMARY KEY,
  world_id TEXT NOT NULL REFERENCES worlds(id) ON DELETE CASCADE,
  display_name TEXT NOT NULL CHECK (length(display_name) > 0),
  display_name_translations_json TEXT NOT NULL DEFAULT '{}',
  root_sort_order INTEGER NOT NULL,
  created_at_ms INTEGER NOT NULL,
  updated_at_ms INTEGER NOT NULL);

CREATE TABLE IF NOT EXISTS world_template_placements (
  id TEXT NOT NULL PRIMARY KEY,
  world_id TEXT NOT NULL REFERENCES worlds(id) ON DELETE CASCADE,
  document_template_id TEXT NOT NULL REFERENCES document_templates(id) ON DELETE CASCADE,
  group_id TEXT REFERENCES world_template_groups(id) ON DELETE SET NULL,
  root_sort_order INTEGER,
  group_sort_order INTEGER,
  nickname TEXT NOT NULL DEFAULT '',
  nickname_translations_json TEXT NOT NULL DEFAULT '{}',
  nickname_singular_translations_json TEXT NOT NULL DEFAULT '{}',
  created_at_ms INTEGER NOT NULL,
  updated_at_ms INTEGER NOT NULL,
  UNIQUE (world_id, document_template_id),
  CHECK ((group_id IS NULL AND root_sort_order IS NOT NULL AND group_sort_order IS NULL)
      OR (group_id IS NOT NULL AND group_sort_order IS NOT NULL AND root_sort_order IS NULL)));

CREATE TABLE IF NOT EXISTS documents (
  id TEXT NOT NULL PRIMARY KEY,
  world_id TEXT NOT NULL REFERENCES worlds(id) ON DELETE RESTRICT,
  template_id TEXT REFERENCES document_templates(id) ON DELETE RESTRICT,
  tree_placement_id TEXT REFERENCES world_template_placements(id) ON DELETE RESTRICT,
  tree_parent_document_id TEXT REFERENCES documents(id) ON DELETE CASCADE,
  tree_custom_sort_order INTEGER NOT NULL DEFAULT 0,
  display_name TEXT NOT NULL CHECK (length(display_name) > 0),
  document_text_color TEXT,
  document_background_color TEXT,
  is_category INTEGER NOT NULL DEFAULT 0 CHECK (is_category IN (0,1)),
  is_finished INTEGER NOT NULL DEFAULT 0 CHECK (is_finished IN (0,1)),
  is_minor INTEGER NOT NULL DEFAULT 0 CHECK (is_minor IN (0,1)),
  is_dead INTEGER NOT NULL DEFAULT 0 CHECK (is_dead IN (0,1)),
  tree_order_number INTEGER NOT NULL DEFAULT -9007199254740991,
  extra_classes TEXT NOT NULL DEFAULT '',
  created_at_ms INTEGER NOT NULL,
  updated_at_ms INTEGER NOT NULL);

CREATE TABLE IF NOT EXISTS tags (
  id TEXT NOT NULL PRIMARY KEY,
  world_id TEXT NOT NULL REFERENCES worlds(id) ON DELETE CASCADE,
  name TEXT NOT NULL CHECK (length(name) > 0),
  created_at_ms INTEGER NOT NULL,
  updated_at_ms INTEGER NOT NULL);

CREATE TABLE IF NOT EXISTS document_tags (
  document_id TEXT NOT NULL REFERENCES documents(id) ON DELETE CASCADE,
  tag_id TEXT NOT NULL REFERENCES tags(id) ON DELETE CASCADE,
  sort_order INTEGER NOT NULL DEFAULT 0,
  PRIMARY KEY (document_id, tag_id));

CREATE TABLE IF NOT EXISTS opened_documents (
  id INTEGER PRIMARY KEY CHECK (id = 1),
  snapshot_json TEXT NOT NULL,
  updated_at_ms INTEGER NOT NULL);

CREATE TABLE IF NOT EXISTS document_last_opened (
  document_id TEXT NOT NULL PRIMARY KEY REFERENCES documents(id) ON DELETE CASCADE,
  opened_at_ms INTEGER NOT NULL);

CREATE UNIQUE INDEX IF NOT EXISTS idx_tags_world_id_name_nocase ON tags(world_id, name COLLATE NOCASE);
CREATE INDEX IF NOT EXISTS idx_documents_world_id ON documents(world_id);
CREATE INDEX IF NOT EXISTS idx_documents_template_id ON documents(template_id);
CREATE INDEX IF NOT EXISTS idx_world_template_groups_world_root_sort ON world_template_groups(world_id, root_sort_order);
"""


def build():
    m = json.load(open(MANIFEST, encoding="utf-8"))
    if os.path.exists(OUT_DB):
        os.remove(OUT_DB)
    db = sqlite3.connect(OUT_DB)
    db.execute("PRAGMA foreign_keys = ON")
    db.executescript(DDL)
    db.execute(f"PRAGMA user_version = {SCHEMA_VERSION}")
    now = int(time.time() * 1000)

    w = m["world"]
    db.execute(
        "INSERT INTO project_data (option_name, option_value) VALUES (?,?)",
        ("project_name", w["name"]))
    db.execute(
        "INSERT INTO project_data (option_name, option_value) VALUES (?,?)",
        ("project_uuid", str(uuid.uuid4())))
    db.execute(
        "INSERT INTO worlds (id,display_name,display_name_translations_json,color,color_palette,"
        "sort_order,created_at_ms,updated_at_ms) VALUES (?,?,?,?,?,?,?,?)",
        (w["id"], w["name"], "{}", w["color"], w["palette"], 0, now, now))

    for t in m["templates"]:
        db.execute(
            "INSERT INTO document_templates (id,display_name,title_translations_json,"
            "title_singular_translations_json,sort_order,world_appendix,"
            "world_appendix_translations_json,icon,created_at_ms,updated_at_ms) "
            "VALUES (?,?,?,?,?,?,?,?,?,?)",
            (t["id"], t["name"], t["title_translations_json"],
             t["title_singular_translations_json"], t["sort_order"],
             t["world_appendix"], t["world_appendix_translations_json"],
             t["icon"], now, now))

    for g in m["groups"]:
        db.execute(
            "INSERT INTO world_template_groups (id,world_id,display_name,"
            "display_name_translations_json,root_sort_order,created_at_ms,updated_at_ms) "
            "VALUES (?,?,?,?,?,?,?)",
            (g["id"], w["id"], g["name"], "{}", g["root_sort_order"], now, now))

    for p in m["placements"]:
        db.execute(
            "INSERT INTO world_template_placements (id,world_id,document_template_id,group_id,"
            "root_sort_order,group_sort_order,nickname,nickname_translations_json,"
            "nickname_singular_translations_json,created_at_ms,updated_at_ms) "
            "VALUES (?,?,?,?,NULL,?,?,?,?,?,?)",
            (p["id"], w["id"], p["template_id"], p["group_id"], p["group_sort_order"],
             p["nickname"], p["nickname_translations_json"],
             p["nickname_singular_translations_json"], now, now))

    for t in m["tags"]:
        db.execute(
            "INSERT INTO tags (id,world_id,name,created_at_ms,updated_at_ms) VALUES (?,?,?,?,?)",
            (t["id"], w["id"], t["name"], now, now))

    docs = sorted(m["documents"], key=lambda d: (d["placement_id"], d["sort_order"]))
    for i, d in enumerate(docs):
        db.execute(
            "INSERT INTO documents (id,world_id,template_id,tree_placement_id,"
            "tree_parent_document_id,tree_custom_sort_order,display_name,document_text_color,"
            "document_background_color,is_category,is_finished,is_minor,is_dead,"
            "tree_order_number,extra_classes,created_at_ms,updated_at_ms) "
            "VALUES (?,?,?,?,?,?,?,NULL,NULL,?,?,?,?,?,?,?,?)",
            (d["id"], w["id"], d["template_id"], d["placement_id"],
             None, i, d["name"],
             d["is_category"], d["is_finished"], d["is_minor"], d["is_dead"],
             i, "", now, now))
        db.execute(
            "INSERT INTO document_tags (document_id,tag_id,sort_order) VALUES (?,?,0)",
            (d["id"], d["tag"]))

    for d in docs:
        if d["parent_document_id"]:
            db.execute("UPDATE documents SET tree_parent_document_id=? WHERE id=?",
                       (d["parent_document_id"], d["id"]))

    db.execute(
        "INSERT INTO opened_documents (id,snapshot_json,updated_at_ms) VALUES (1,'{}',?)", (now,))
    db.commit()

    cur = db.execute("SELECT COUNT(*) FROM documents").fetchone()[0]
    fk = db.execute("PRAGMA foreign_key_check").fetchall()
    db.close()
    print(f"wrote {OUT_DB}")
    print(f"documents={cur} foreign_key_violations={len(fk)}")


if __name__ == "__main__":
    build()
