import type Database from 'better-sqlite3'

import { FA_PROJECT_DATA_TABLE_NAME } from './projectManagement_managerDefaults'

/**
 * Upserts a single keyed row under 'project_data' (active project SQLite file).
 */
export function upsertFaProjectDataKv (
  db: Database,
  optionName: string,
  optionValue: string
): void {
  const sql =
    `INSERT INTO ${FA_PROJECT_DATA_TABLE_NAME} (option_name, option_value) ` +
    'VALUES (@name, @value) ON CONFLICT(option_name) DO UPDATE SET ' +
    'option_value = excluded.option_value'
  db.prepare(sql).run({
    name: optionName,
    value: optionValue
  })
}

/**
 * Returns the trimmed text value for a key, or 'undefined' when the row is missing.
 */
export function readFaProjectDataKv (
  db: Database,
  optionName: string
): string | undefined {
  const sql =
    `SELECT option_value AS v FROM ${FA_PROJECT_DATA_TABLE_NAME} ` +
    'WHERE option_name = ?'
  const row = db.prepare(sql).get(optionName) as { v?: string } | undefined
  return row?.v
}
