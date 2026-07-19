import { expect, test } from 'vitest'

import { applyFaProjectDocumentCategorySchemaPatch } from '../faProjectDocumentCategorySchemaPatchWiring'

test('Test that applyFaProjectDocumentCategorySchemaPatch adds is_category column idempotently', () => {
  const execCalls: string[] = []
  const db = {
    exec: (sql: string) => {
      execCalls.push(sql)
    },
    pragma: () => []
  }

  applyFaProjectDocumentCategorySchemaPatch(db as never)
  expect(execCalls.some((sql) => sql.includes('is_category'))).toBe(true)

  execCalls.length = 0
  const dbWithColumn = {
    exec: (sql: string) => {
      execCalls.push(sql)
    },
    pragma: () => [{ name: 'is_category' }]
  }
  applyFaProjectDocumentCategorySchemaPatch(dbWithColumn as never)
  expect(execCalls.length).toBe(0)
})
