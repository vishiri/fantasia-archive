import { expect, test, vi } from 'vitest'

import {
  applyFaProjectContentSchemaV1,
  applyFaProjectProjectDataSchemaV1,
  FA_PROJECT_TABLE_DOCUMENTS,
  FA_PROJECT_TABLE_DOCUMENT_TEMPLATES,
  FA_PROJECT_TABLE_OPENED_DOCUMENTS,
  FA_PROJECT_TABLE_WORLDS,
  FA_PROJECT_DOCUMENT_TREE_CUSTOM_SORT_ORDER_COLUMN,
  FA_PROJECT_DOCUMENT_TREE_PARENT_DOCUMENT_ID_COLUMN,
  FA_PROJECT_DOCUMENT_TREE_PLACEMENT_ID_COLUMN,
  FA_PROJECT_DOCUMENT_TREE_PLACEMENT_PARENT_SORT_INDEX
} from '../faProjectDbSchemaDdl'

/**
 * applyFaProjectProjectDataSchemaV1
 * Executes DDL that creates the project_data KV table.
 */
test('Test that applyFaProjectProjectDataSchemaV1 runs exec with project_data DDL', () => {
  const exec = vi.fn()
  applyFaProjectProjectDataSchemaV1({
    exec,
    pragma: vi.fn()
  })
  expect(exec).toHaveBeenCalledOnce()
  const sql = exec.mock.calls[0]![0]! as string
  expect(sql).toContain('project_data')
})

/**
 * applyFaProjectContentSchemaV1
 * Executes full content-table DDL for schema version 1.
 */
test('Test that applyFaProjectContentSchemaV1 runs exec with worlds and related tables', () => {
  const exec = vi.fn()
  applyFaProjectContentSchemaV1({
    exec,
    pragma: vi.fn()
  })
  expect(exec).toHaveBeenCalledTimes(3)
  const sql = `${exec.mock.calls[0]![0] as string}${exec.mock.calls[1]![0] as string}${exec.mock.calls[2]![0] as string}`
  expect(sql).toContain(FA_PROJECT_TABLE_DOCUMENTS)
  expect(sql).toContain(FA_PROJECT_TABLE_OPENED_DOCUMENTS)
  expect(sql).toContain(FA_PROJECT_TABLE_WORLDS)
  expect(sql).toContain('color_pallete')
  expect(sql).toContain("color = '' OR")
  expect(sql).toContain('document_text_color')
  expect(sql).toContain("document_text_color = '' OR")
  expect(sql).toContain("document_background_color = '' OR")
  expect(sql).toContain('sort_order')
  expect(sql).toContain(FA_PROJECT_TABLE_DOCUMENT_TEMPLATES)
  expect(sql).toContain('document_media')
  expect(sql).toContain('idx_worlds_sort_order')
  expect(sql).toContain('world_template_groups')
  expect(sql).toContain('world_template_placements')
  expect(sql).toContain('nickname')
  expect(sql).toContain(FA_PROJECT_DOCUMENT_TREE_PLACEMENT_ID_COLUMN)
  expect(sql).toContain(FA_PROJECT_DOCUMENT_TREE_PARENT_DOCUMENT_ID_COLUMN)
  expect(sql).toContain(FA_PROJECT_DOCUMENT_TREE_CUSTOM_SORT_ORDER_COLUMN)
  expect(sql).toContain(FA_PROJECT_DOCUMENT_TREE_PLACEMENT_PARENT_SORT_INDEX)
  expect(sql).not.toContain('world_document_templates')
  expect(sql).not.toContain('world_media')
})
