import { expect, test } from 'vitest'

import { applyFaProjectDocumentExtraClassesSchemaPatch } from '../faProjectDocumentExtraClassesSchemaPatchWiring'

test('Test that applyFaProjectDocumentExtraClassesSchemaPatch adds extra_classes idempotently', () => {
  const execCalls: string[] = []
  const db = {
    exec: (sql: string) => {
      execCalls.push(sql)
    },
    pragma: () => {
      return []
    }
  }

  applyFaProjectDocumentExtraClassesSchemaPatch(db)
  expect(execCalls[0]).toContain('extra_classes')

  const secondDb = {
    exec: (sql: string) => {
      execCalls.push(sql)
    },
    pragma: () => {
      return [
        { name: 'extra_classes' }
      ]
    }
  }
  applyFaProjectDocumentExtraClassesSchemaPatch(secondDb)
  expect(execCalls).toHaveLength(1)
})
