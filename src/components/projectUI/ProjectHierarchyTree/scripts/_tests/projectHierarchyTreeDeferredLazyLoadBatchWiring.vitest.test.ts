/** @vitest-environment jsdom */
import { expect, test, vi } from 'vitest'
import { ref } from 'vue'

import { runProjectHierarchyTreeDeferredLazyLoadBatch } from '../projectHierarchyTreeDeferredLazyLoadBatchWiring'

test('Test that runProjectHierarchyTreeDeferredLazyLoadBatch flushes and reopens after batch', async () => {
  const deferLazyLoadTreeRevisionPublish = ref(false)
  const order: string[] = []
  await runProjectHierarchyTreeDeferredLazyLoadBatch({
    deferLazyLoadTreeRevisionPublish,
    flushDeferredTreeRevisionPublish: async () => {
      order.push('flush')
    },
    reapplyHeTreeOpenState: () => {
      order.push('reapply')
    },
    runBatch: async () => {
      order.push('batch')
    }
  })
  expect(order).toEqual(['batch', 'flush', 'reapply'])
  expect(deferLazyLoadTreeRevisionPublish.value).toBe(false)
})

test('Test that runProjectHierarchyTreeDeferredLazyLoadBatch can skip reapply after flush', async () => {
  const deferLazyLoadTreeRevisionPublish = ref(false)
  const reapplyHeTreeOpenState = vi.fn()
  await runProjectHierarchyTreeDeferredLazyLoadBatch({
    deferLazyLoadTreeRevisionPublish,
    flushDeferredTreeRevisionPublish: async () => undefined,
    reapplyHeTreeOpenState,
    runBatch: async () => undefined,
    skipReapplyHeTreeOpenState: true
  })
  expect(reapplyHeTreeOpenState).not.toHaveBeenCalled()
})

test('Test that runProjectHierarchyTreeDeferredLazyLoadBatch nests without double flush', async () => {
  const deferLazyLoadTreeRevisionPublish = ref(false)
  const flushDeferredTreeRevisionPublish = vi.fn(async () => undefined)
  const reapplyHeTreeOpenState = vi.fn()
  await runProjectHierarchyTreeDeferredLazyLoadBatch({
    deferLazyLoadTreeRevisionPublish,
    flushDeferredTreeRevisionPublish,
    reapplyHeTreeOpenState,
    runBatch: async () => {
      await runProjectHierarchyTreeDeferredLazyLoadBatch({
        deferLazyLoadTreeRevisionPublish,
        flushDeferredTreeRevisionPublish,
        reapplyHeTreeOpenState,
        runBatch: async () => undefined
      })
    }
  })
  expect(flushDeferredTreeRevisionPublish).toHaveBeenCalledTimes(1)
  expect(reapplyHeTreeOpenState).toHaveBeenCalledTimes(1)
})
