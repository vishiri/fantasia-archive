#!/usr/bin/env python3
"""One-shot manual-perf seed: writes a .faproject with many nested documents.

Shape: 3 worlds x 10 templates (placements) x docs nested across 4 levels
(depth 0 = placement root ... depth 3). Depths chosen at random; parents
always exist at depth-1 before a child is attached.

Uses stdlib sqlite3 so Electron-locked better-sqlite3 is not required.

Usage (from repo root):
  python .utility-scripts/seedPerfHierarchy50kFaproject.py
  python .utility-scripts/seedPerfHierarchy50kFaproject.py path/to/out.faproject
  python .utility-scripts/seedPerfHierarchy50kFaproject.py --count 1000 path/to/out.faproject

Default out: test-results/perf-hierarchy-50k.faproject (gitignored).
"""

from __future__ import annotations

import argparse
import json
import random
import sqlite3
import time
import uuid
from pathlib import Path

WORLD_COUNT = 3
TEMPLATE_COUNT = 10
NEST_DEPTH_COUNT = 4
TOTAL_DOCUMENTS = 50_000
USER_VERSION = 6
TREE_ORDER_EMPTY = -9007199254740991

WORLD_COLORS = ("#4A90D9", "#D94A4A", "#4AD97A")
TEMPLATE_NAMES = (
    "Characters",
    "Locations",
    "Items",
    "Factions",
    "Events",
    "Creatures",
    "Cultures",
    "Languages",
    "Religions",
    "Artifacts",
)

SCHEMA_SQL = f"""
CREATE TABLE IF NOT EXISTS project_data (
  option_id INTEGER PRIMARY KEY,
  option_name TEXT NOT NULL UNIQUE CHECK (length(option_name) BETWEEN 1 AND 255),
  option_value TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS worlds (
  id TEXT NOT NULL PRIMARY KEY,
  display_name TEXT NOT NULL CHECK (length(display_name) > 0),
  display_name_translations_json TEXT NOT NULL DEFAULT '{{}}',
  color TEXT NOT NULL DEFAULT '#808080'
  CHECK (color = '' OR (length(color) = 7 AND substr(color, 1, 1) = '#')),
  color_palette TEXT NOT NULL DEFAULT '',
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at_ms INTEGER NOT NULL,
  updated_at_ms INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS document_templates (
  id TEXT NOT NULL PRIMARY KEY,
  display_name TEXT NOT NULL CHECK (length(display_name) > 0),
  title_translations_json TEXT NOT NULL DEFAULT '{{}}',
  title_singular_translations_json TEXT NOT NULL DEFAULT '{{}}',
  sort_order INTEGER NOT NULL DEFAULT 0,
  world_appendix TEXT NOT NULL DEFAULT '',
  world_appendix_translations_json TEXT NOT NULL DEFAULT '{{}}',
  icon TEXT NOT NULL DEFAULT '',
  created_at_ms INTEGER NOT NULL,
  updated_at_ms INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS media (
  id TEXT NOT NULL PRIMARY KEY,
  display_name TEXT NOT NULL CHECK (length(display_name) > 0),
  created_at_ms INTEGER NOT NULL,
  updated_at_ms INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS world_template_groups (
  id TEXT NOT NULL PRIMARY KEY,
  world_id TEXT NOT NULL REFERENCES worlds(id) ON DELETE CASCADE,
  display_name TEXT NOT NULL CHECK (length(display_name) > 0),
  display_name_translations_json TEXT NOT NULL DEFAULT '{{}}',
  root_sort_order INTEGER NOT NULL,
  created_at_ms INTEGER NOT NULL,
  updated_at_ms INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS world_template_placements (
  id TEXT NOT NULL PRIMARY KEY,
  world_id TEXT NOT NULL REFERENCES worlds(id) ON DELETE CASCADE,
  document_template_id TEXT NOT NULL REFERENCES document_templates(id) ON DELETE CASCADE,
  group_id TEXT REFERENCES world_template_groups(id) ON DELETE SET NULL,
  root_sort_order INTEGER,
  group_sort_order INTEGER,
  nickname TEXT NOT NULL DEFAULT '',
  nickname_translations_json TEXT NOT NULL DEFAULT '{{}}',
  nickname_singular_translations_json TEXT NOT NULL DEFAULT '{{}}',
  created_at_ms INTEGER NOT NULL,
  updated_at_ms INTEGER NOT NULL,
  UNIQUE (world_id, document_template_id),
  CHECK (
    (group_id IS NULL AND root_sort_order IS NOT NULL AND group_sort_order IS NULL)
    OR
    (group_id IS NOT NULL AND group_sort_order IS NOT NULL AND root_sort_order IS NULL)
  )
);

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
  is_category INTEGER NOT NULL DEFAULT 0 CHECK (is_category IN (0, 1)),
  is_finished INTEGER NOT NULL DEFAULT 0 CHECK (is_finished IN (0, 1)),
  is_minor INTEGER NOT NULL DEFAULT 0 CHECK (is_minor IN (0, 1)),
  is_dead INTEGER NOT NULL DEFAULT 0 CHECK (is_dead IN (0, 1)),
  tree_order_number INTEGER NOT NULL DEFAULT {TREE_ORDER_EMPTY},
  extra_classes TEXT NOT NULL DEFAULT '',
  created_at_ms INTEGER NOT NULL,
  updated_at_ms INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS document_media (
  document_id TEXT NOT NULL REFERENCES documents(id) ON DELETE CASCADE,
  media_id TEXT NOT NULL REFERENCES media(id) ON DELETE CASCADE,
  PRIMARY KEY (document_id, media_id)
);

CREATE TABLE IF NOT EXISTS opened_documents (
  id INTEGER PRIMARY KEY CHECK (id = 1),
  snapshot_json TEXT NOT NULL,
  updated_at_ms INTEGER NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_world_template_groups_world_root_sort
  ON world_template_groups(world_id, root_sort_order);
CREATE INDEX IF NOT EXISTS idx_world_template_placements_world_root_sort
  ON world_template_placements(world_id, root_sort_order);
CREATE INDEX IF NOT EXISTS idx_world_template_placements_group_sort
  ON world_template_placements(group_id, group_sort_order);
CREATE INDEX IF NOT EXISTS idx_world_template_placements_document_template_id
  ON world_template_placements(document_template_id);
CREATE INDEX IF NOT EXISTS idx_documents_world_id ON documents(world_id);
CREATE INDEX IF NOT EXISTS idx_documents_template_id ON documents(template_id);
CREATE INDEX IF NOT EXISTS idx_documents_tree_placement_parent_sort
  ON documents(tree_placement_id, tree_parent_document_id, tree_custom_sort_order);
CREATE INDEX IF NOT EXISTS idx_document_media_media_id ON document_media(media_id);
CREATE INDEX IF NOT EXISTS idx_worlds_sort_order ON worlds(sort_order);
CREATE INDEX IF NOT EXISTS idx_document_templates_sort_order ON document_templates(sort_order);
"""


def en_us_json(value: str) -> str:
    return json.dumps({"en-US": value}, separators=(",", ":"))


def build_placement_documents(
    placement: dict,
    count: int,
) -> list[dict]:
    by_depth: list[list[str]] = [[] for _ in range(NEST_DEPTH_COUNT)]
    sibling_sort: dict[str, int] = {}
    rows: list[dict] = []

    def next_sort(parent_id: str | None) -> int:
        key = parent_id or "__root__"
        value = sibling_sort.get(key, 0)
        sibling_sort[key] = value + 1
        return value

    def push_doc(depth: int, parent_id: str | None) -> str:
        doc_id = str(uuid.uuid4())
        sort = next_sort(parent_id)
        name = f"{placement['template_name']} L{depth} #{len(by_depth[depth]) + 1}"
        rows.append(
            {
                "id": doc_id,
                "world_id": placement["world_id"],
                "template_id": placement["template_id"],
                "placement_id": placement["placement_id"],
                "parent_id": parent_id,
                "sort": sort,
                "name": name,
                "depth": depth,
            }
        )
        by_depth[depth].append(doc_id)
        return doc_id

    parent: str | None = None
    for depth in range(NEST_DEPTH_COUNT):
        parent = push_doc(depth, parent)

    remaining = max(0, count - len(rows))
    for _ in range(remaining):
        depth = random.randrange(NEST_DEPTH_COUNT)
        while depth > 0 and not by_depth[depth - 1]:
            depth -= 1
        parent_id = None if depth == 0 else random.choice(by_depth[depth - 1])
        push_doc(depth, parent_id)

    rows.sort(key=lambda row: row["depth"])
    return rows


def main() -> None:
    repo_root = Path(__file__).resolve().parents[1]
    default_out = repo_root / "test-results" / "perf-hierarchy-50k.faproject"

    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument(
        "out_path",
        nargs="?",
        default=str(default_out),
        help=f"Output .faproject path (default: {default_out})",
    )
    parser.add_argument(
        "--seed",
        type=int,
        default=42,
        help="RNG seed for reproducible nesting (default: 42)",
    )
    parser.add_argument(
        "--count",
        type=int,
        default=TOTAL_DOCUMENTS,
        help=f"Total documents to insert (default: {TOTAL_DOCUMENTS})",
    )
    args = parser.parse_args()

    if args.count < 1:
        raise SystemExit("--count must be >= 1")

    random.seed(args.seed)
    out_path = Path(args.out_path).resolve()
    out_path.parent.mkdir(parents=True, exist_ok=True)
    if out_path.exists():
        out_path.unlink()

    document_count = args.count
    started = time.time()
    print(f"Seeding {document_count} documents -> {out_path}")

    now_ms = int(time.time() * 1000)
    conn = sqlite3.connect(out_path)
    conn.execute("PRAGMA foreign_keys = ON")
    conn.execute("PRAGMA synchronous = OFF")
    conn.executescript(SCHEMA_SQL)
    conn.execute(f"PRAGMA user_version = {USER_VERSION}")

    project_name = f"Perf Hierarchy {document_count // 1000}k" if document_count >= 1000 and document_count % 1000 == 0 else f"Perf Hierarchy {document_count}"
    if document_count == TOTAL_DOCUMENTS:
        project_name = "Perf Hierarchy 50k"
    project_uuid = str(uuid.uuid4())
    conn.execute(
        "INSERT INTO project_data (option_name, option_value) VALUES (?, ?)",
        ("project_name", project_name),
    )
    conn.execute(
        "INSERT INTO project_data (option_name, option_value) VALUES (?, ?)",
        ("project_uuid", project_uuid),
    )

    worlds: list[dict] = []
    for index in range(WORLD_COUNT):
        world_id = str(uuid.uuid4())
        name = f"World {chr(ord('A') + index)}"
        conn.execute(
            """
            INSERT INTO worlds (
              id, display_name, display_name_translations_json, color, color_palette,
              sort_order, created_at_ms, updated_at_ms
            ) VALUES (?, ?, ?, ?, '', ?, ?, ?)
            """,
            (world_id, name, en_us_json(name), WORLD_COLORS[index], index, now_ms, now_ms),
        )
        worlds.append({"id": world_id, "name": name})

    templates: list[dict] = []
    for index, plural in enumerate(TEMPLATE_NAMES):
        template_id = str(uuid.uuid4())
        singular = plural[:-1] if plural.endswith("s") else plural
        conn.execute(
            """
            INSERT INTO document_templates (
              id, display_name, title_translations_json, title_singular_translations_json,
              sort_order, world_appendix, world_appendix_translations_json, icon,
              created_at_ms, updated_at_ms
            ) VALUES (?, ?, ?, ?, ?, '', '{}', '', ?, ?)
            """,
            (
                template_id,
                plural,
                en_us_json(plural),
                en_us_json(singular),
                index,
                now_ms,
                now_ms,
            ),
        )
        templates.append({"id": template_id, "name": plural})

    placements: list[dict] = []
    for world in worlds:
        for root_sort, template in enumerate(templates):
            placement_id = str(uuid.uuid4())
            conn.execute(
                """
                INSERT INTO world_template_placements (
                  id, world_id, document_template_id, group_id, root_sort_order, group_sort_order,
                  nickname, nickname_translations_json, nickname_singular_translations_json,
                  created_at_ms, updated_at_ms
                ) VALUES (?, ?, ?, NULL, ?, NULL, '', '{}', '{}', ?, ?)
                """,
                (placement_id, world["id"], template["id"], root_sort, now_ms, now_ms),
            )
            placements.append(
                {
                    "placement_id": placement_id,
                    "world_id": world["id"],
                    "template_id": template["id"],
                    "template_name": template["name"],
                }
            )

    bucket_count = len(placements)
    base_count = document_count // bucket_count
    remainder = document_count % bucket_count
    depth_histogram = [0] * NEST_DEPTH_COUNT
    inserted = 0

    insert_sql = """
      INSERT INTO documents (
        id, world_id, template_id, tree_placement_id, tree_parent_document_id,
        tree_custom_sort_order, display_name, document_text_color, document_background_color,
        is_category, is_finished, is_minor, is_dead, tree_order_number, extra_classes,
        created_at_ms, updated_at_ms
      ) VALUES (?, ?, ?, ?, ?, ?, ?, NULL, NULL, 0, 0, 0, 0, ?, '', ?, ?)
    """

    for index, placement in enumerate(placements):
        count = base_count + (1 if index < remainder else 0)
        docs = build_placement_documents(placement, count)
        for doc in docs:
            depth_histogram[doc["depth"]] += 1
        conn.executemany(
            insert_sql,
            [
                (
                    doc["id"],
                    doc["world_id"],
                    doc["template_id"],
                    doc["placement_id"],
                    doc["parent_id"],
                    doc["sort"],
                    doc["name"],
                    TREE_ORDER_EMPTY,
                    now_ms,
                    now_ms,
                )
                for doc in docs
            ],
        )
        inserted += len(docs)
        if (index + 1) % 5 == 0 or index == len(placements) - 1:
            print(f"  placements {index + 1}/{len(placements)} — docs so far {inserted}")

    conn.commit()
    conn.execute("PRAGMA synchronous = FULL")
    quick_check = conn.execute("PRAGMA quick_check").fetchone()[0]
    if quick_check != "ok":
        raise RuntimeError(f"quick_check failed: {quick_check}")

    counted = conn.execute("SELECT COUNT(*) FROM documents").fetchone()[0]
    conn.close()

    elapsed = time.time() - started
    print("Done.")
    print(f"  file: {out_path}")
    print(f"  documents: {counted} (target {document_count})")
    print(
        f"  worlds: {WORLD_COUNT}, templates: {TEMPLATE_COUNT}, "
        f"placements: {bucket_count}"
    )
    print(f"  depth counts L0-L3: {', '.join(str(v) for v in depth_histogram)}")
    print(f"  rng seed: {args.seed}")
    print(f"  elapsed: {elapsed:.1f}s")


if __name__ == "__main__":
    main()
