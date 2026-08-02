import { afterEach, expect, test, vi } from 'vitest'

import { resolveFaHideDeadCrossThroughEnabled } from '../functions/faHideDeadCrossThroughDom'
import {
  applyFaHideDeadCrossThroughToDocument,
  FA_HIDE_DEAD_CROSS_THROUGH_BODY_CLASS
} from '../faHideDeadCrossThroughApplyWiring'

afterEach(() => {
  vi.unstubAllGlobals()
})

/**
 * resolveFaHideDeadCrossThroughEnabled
 * Preview wins, then persisted settings, then default.
 */
test('Test that resolveFaHideDeadCrossThroughEnabled prefers preview then settings then default', () => {
  expect(resolveFaHideDeadCrossThroughEnabled(false, true, false)).toBe(true)
  expect(resolveFaHideDeadCrossThroughEnabled(true, undefined, false)).toBe(true)
  expect(resolveFaHideDeadCrossThroughEnabled(undefined, undefined, true)).toBe(true)
  expect(resolveFaHideDeadCrossThroughEnabled(undefined, undefined, false)).toBe(false)
})

/**
 * applyFaHideDeadCrossThroughToDocument
 * Adds or removes the body class that scopes off dead-label line-through.
 */
test('Test that applyFaHideDeadCrossThroughToDocument toggles the body class', () => {
  const classes = new Set<string>()
  const body = {
    classList: {
      add: vi.fn((className: string) => {
        classes.add(className)
      }),
      remove: vi.fn((className: string) => {
        classes.delete(className)
      })
    }
  }
  vi.stubGlobal('document', { body })

  applyFaHideDeadCrossThroughToDocument(true)
  expect(body.classList.add).toHaveBeenCalledWith(FA_HIDE_DEAD_CROSS_THROUGH_BODY_CLASS)
  expect(classes.has(FA_HIDE_DEAD_CROSS_THROUGH_BODY_CLASS)).toBe(true)

  applyFaHideDeadCrossThroughToDocument(false)
  expect(body.classList.remove).toHaveBeenCalledWith(FA_HIDE_DEAD_CROSS_THROUGH_BODY_CLASS)
  expect(classes.has(FA_HIDE_DEAD_CROSS_THROUGH_BODY_CLASS)).toBe(false)
})

/**
 * applyFaHideDeadCrossThroughToDocument
 * No-ops when document is undefined (SSR / early boot).
 */
test('Test that applyFaHideDeadCrossThroughToDocument skips when document is undefined', () => {
  vi.stubGlobal('document', undefined)
  expect(() => {
    applyFaHideDeadCrossThroughToDocument(true)
  }).not.toThrow()
})
