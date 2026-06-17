import type { I_faProjectDbMigrationExec } from 'app/types/I_faProjectDbSchemaDdl'

interface I_junctionMigrationRow {
  world_id: string
  document_template_id: string
  sort_order: number
  created_at_ms: number
}

/**
 * Schema v6: world_template_groups + world_template_placements replace world_document_templates.
 */
export function migrateFaProjectSchemaV5ToV6 (
  db: I_faProjectDbMigrationExec,
  deps: {
    applyLayoutSchema: (db: I_faProjectDbMigrationExec) => void
    createPlacementId: () => string
    junctionTableName: string
  }
): void {
  deps.applyLayoutSchema(db)

  const junctionExists = db
    .prepare(
      'SELECT name FROM sqlite_master WHERE type = \'table\' AND name = ?'
    )
    .get(deps.junctionTableName) as { name: string } | undefined

  if (junctionExists !== undefined) {
    const rows = db
      .prepare(
        'SELECT wdt.world_id, wdt.document_template_id, t.sort_order, t.created_at_ms ' +
          `FROM ${deps.junctionTableName} wdt ` +
          'INNER JOIN document_templates t ON t.id = wdt.document_template_id ' +
          'ORDER BY wdt.world_id ASC, t.sort_order ASC, t.created_at_ms ASC, t.id ASC'
      )
      .all() as I_junctionMigrationRow[]

    const insertPlacement = db.prepare(
      'INSERT INTO world_template_placements ' +
        '(id, world_id, document_template_id, group_id, root_sort_order, group_sort_order, ' +
        'created_at_ms, updated_at_ms) VALUES (?, ?, ?, NULL, ?, NULL, ?, ?)'
    )

    let currentWorldId: string | null = null
    let rootIndex = 0
    const nowMs = Date.now()

    for (const row of rows) {
      if (row.world_id !== currentWorldId) {
        currentWorldId = row.world_id
        rootIndex = 0
      }
      const timestampMs = row.created_at_ms > 0 ? row.created_at_ms : nowMs
      insertPlacement.run(
        deps.createPlacementId(),
        row.world_id,
        row.document_template_id,
        rootIndex,
        timestampMs,
        timestampMs
      )
      rootIndex += 1
    }

    db.exec(`DROP TABLE IF EXISTS ${deps.junctionTableName};`)
  }

  db.pragma('user_version = 6')
}
