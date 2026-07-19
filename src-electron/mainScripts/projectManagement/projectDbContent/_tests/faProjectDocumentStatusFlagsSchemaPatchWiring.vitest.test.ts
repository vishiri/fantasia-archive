import { expect, test, vi } from 'vitest'

import { applyFaProjectDocumentStatusFlagsSchemaPatch } from '../faProjectDocumentStatusFlagsSchemaPatchWiring'

test('Test that applyFaProjectDocumentStatusFlagsSchemaPatch adds status columns idempotently', () => {
  const execCalls: string[] = []
  const db = {
    exec: (sql: string) => {
      execCalls.push(sql)
    },
    pragma: () => []
  }
  applyFaProjectDocumentStatusFlagsSchemaPatch(db as never)
  expect(execCalls).toHaveLength(3)
  expect(execCalls[0]).toContain('is_finished')
  expect(execCalls[1]).toContain('is_minor')
  expect(execCalls[2]).toContain('is_dead')

  const dbWithColumns = {
    exec: vi.fn(),
    pragma: () => [
      { name: 'is_finished' },
      { name: 'is_minor' },
      { name: 'is_dead' }
    ]
  }
  applyFaProjectDocumentStatusFlagsSchemaPatch(dbWithColumns as never)
  expect(dbWithColumns.exec).not.toHaveBeenCalled()
})
