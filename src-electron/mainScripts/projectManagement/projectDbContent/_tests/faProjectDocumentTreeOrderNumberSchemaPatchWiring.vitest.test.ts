import { expect, test, vi } from 'vitest'

import { applyFaProjectDocumentTreeOrderNumberSchemaPatch } from '../faProjectDocumentTreeOrderNumberSchemaPatchWiring'

test('Test that applyFaProjectDocumentTreeOrderNumberSchemaPatch adds tree_order_number idempotently', () => {
  const execCalls: string[] = []
  const db = {
    exec: (sql: string) => {
      execCalls.push(sql)
    },
    pragma: () => []
  }
  applyFaProjectDocumentTreeOrderNumberSchemaPatch(db as never)
  expect(execCalls).toHaveLength(1)
  expect(execCalls[0]).toContain('tree_order_number')

  const dbWithColumn = {
    exec: vi.fn(),
    pragma: () => [
      { name: 'tree_order_number' }
    ]
  }
  applyFaProjectDocumentTreeOrderNumberSchemaPatch(dbWithColumn as never)
  expect(dbWithColumn.exec).not.toHaveBeenCalled()
})
