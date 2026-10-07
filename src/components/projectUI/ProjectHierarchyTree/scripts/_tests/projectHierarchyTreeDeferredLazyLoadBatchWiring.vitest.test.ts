/** @vitest-environment jsdom */
import { expect, test, vi } from 'vitest'
import { ref } from 'vue'

import { runProjectHierarchyTreeDeferredLazyLoadBatch } from '../projectHierarchyTreeLazyLoadWiring'

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

test('Test that overlapping deferred lazy loads publish once after the slower load', async () => {
  const deferLazyLoadTreeRevisionPublish = ref(false)
  const flushDeferredTreeRevisionPublish = vi.fn(async () => undefined)
  const reapplyHeTreeOpenState = vi.fn()
  let releaseSlower: () => void = () => undefined
  const slowerGate = new Promise<void>((resolve) => {
    releaseSlower = resolve
  })
  let markSlowerStarted: () => void = () => undefined
  const slowerStarted = new Promise<void>((resolve) => {
    markSlowerStarted = resolve
  })
  const faster = runProjectHierarchyTreeDeferredLazyLoadBatch({
    deferLazyLoadTreeRevisionPublish,
    flushDeferredTreeRevisionPublish,
    reapplyHeTreeOpenState,
    runBatch: async () => {
      await slowerStarted
    }
  })
  const slower = runProjectHierarchyTreeDeferredLazyLoadBatch({
    deferLazyLoadTreeRevisionPublish,
    flushDeferredTreeRevisionPublish,
    reapplyHeTreeOpenState,
    runBatch: async () => {
      markSlowerStarted()
      await slowerGate
    }
  })
  await slowerStarted
  await Promise.resolve()
  expect(flushDeferredTreeRevisionPublish).not.toHaveBeenCalled()
  expect(deferLazyLoadTreeRevisionPublish.value).toBe(true)
  releaseSlower()
  await faster
  await slower
  expect(flushDeferredTreeRevisionPublish).toHaveBeenCalledTimes(1)
  expect(reapplyHeTreeOpenState).toHaveBeenCalledTimes(1)
  expect(deferLazyLoadTreeRevisionPublish.value).toBe(false)
})

test('Test that a deferred lazy load started during publish stays deferred until it finishes', async () => {
  const deferLazyLoadTreeRevisionPublish = ref(false)
  const reapplyHeTreeOpenState = vi.fn()
  let releaseLater: () => void = () => undefined
  const laterGate = new Promise<void>((resolve) => {
    releaseLater = resolve
  })
  let laterLoad: Promise<void> | undefined
  const flushDeferredTreeRevisionPublish = vi.fn(async () => {
    if (laterLoad !== undefined) {
      return
    }
    laterLoad = runProjectHierarchyTreeDeferredLazyLoadBatch({
      deferLazyLoadTreeRevisionPublish,
      flushDeferredTreeRevisionPublish,
      reapplyHeTreeOpenState,
      runBatch: async () => {
        await laterGate
      }
    })
  })
  await runProjectHierarchyTreeDeferredLazyLoadBatch({
    deferLazyLoadTreeRevisionPublish,
    flushDeferredTreeRevisionPublish,
    reapplyHeTreeOpenState,
    runBatch: async () => undefined
  })
  expect(flushDeferredTreeRevisionPublish).toHaveBeenCalledTimes(1)
  expect(reapplyHeTreeOpenState).not.toHaveBeenCalled()
  expect(deferLazyLoadTreeRevisionPublish.value).toBe(true)
  releaseLater()
  await laterLoad
  expect(flushDeferredTreeRevisionPublish).toHaveBeenCalledTimes(2)
  expect(reapplyHeTreeOpenState).toHaveBeenCalledTimes(1)
  expect(deferLazyLoadTreeRevisionPublish.value).toBe(false)
})

test('Test that a failed deferred lazy load does not cancel a sibling load that succeeded', async () => {
  const deferLazyLoadTreeRevisionPublish = ref(false)
  const flushDeferredTreeRevisionPublish = vi.fn(async () => undefined)
  const reapplyHeTreeOpenState = vi.fn()
  let releaseSuccess: () => void = () => undefined
  const successGate = new Promise<void>((resolve) => {
    releaseSuccess = resolve
  })
  let markSuccessStarted: () => void = () => undefined
  const successStarted = new Promise<void>((resolve) => {
    markSuccessStarted = resolve
  })
  const successLoad = runProjectHierarchyTreeDeferredLazyLoadBatch({
    deferLazyLoadTreeRevisionPublish,
    flushDeferredTreeRevisionPublish,
    reapplyHeTreeOpenState,
    runBatch: async () => {
      markSuccessStarted()
      await successGate
    }
  })
  const failedLoad = runProjectHierarchyTreeDeferredLazyLoadBatch({
    deferLazyLoadTreeRevisionPublish,
    flushDeferredTreeRevisionPublish,
    reapplyHeTreeOpenState,
    runBatch: async () => {
      await successStarted
      throw new Error('load failed')
    }
  })
  await expect(failedLoad).rejects.toThrow('load failed')
  expect(flushDeferredTreeRevisionPublish).not.toHaveBeenCalled()
  expect(deferLazyLoadTreeRevisionPublish.value).toBe(true)
  releaseSuccess()
  await successLoad
  expect(flushDeferredTreeRevisionPublish).toHaveBeenCalledTimes(1)
  expect(reapplyHeTreeOpenState).toHaveBeenCalledTimes(1)
  expect(deferLazyLoadTreeRevisionPublish.value).toBe(false)
})

test('Test that a failed deferred lazy load does not publish a partial tree', async () => {
  const deferLazyLoadTreeRevisionPublish = ref(false)
  const flushDeferredTreeRevisionPublish = vi.fn(async () => undefined)
  await expect(runProjectHierarchyTreeDeferredLazyLoadBatch({
    deferLazyLoadTreeRevisionPublish,
    flushDeferredTreeRevisionPublish,
    reapplyHeTreeOpenState: () => undefined,
    runBatch: async () => {
      throw new Error('load failed')
    }
  })).rejects.toThrow('load failed')
  expect(flushDeferredTreeRevisionPublish).not.toHaveBeenCalled()
  expect(deferLazyLoadTreeRevisionPublish.value).toBe(false)
})
