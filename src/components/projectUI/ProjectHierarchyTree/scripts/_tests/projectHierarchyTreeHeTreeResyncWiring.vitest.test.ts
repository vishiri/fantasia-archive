/** @vitest-environment jsdom */
import { expect, test, vi } from 'vitest'
import { ref } from 'vue'

import { createProjectHierarchyTreeHeTreeResyncController } from '../projectHierarchyTreeHeTreeResyncWiring'

test('Test that soft he-tree resync skips full reapply without remounting', async () => {
  const treeMountKey = ref(0)
  const reapplyHeTreeOpenState = vi.fn()
  const controller = createProjectHierarchyTreeHeTreeResyncController({
    nextTick: async () => undefined,
    reapplyHeTreeOpenState,
    requestAnimationFrame: (callback) => {
      callback()
      return 0
    },
    suppressTreeEmit: ref(false),
    treeMountKey
  })
  await controller.resyncHeTreeFromPublishedTreeData()
  expect(treeMountKey.value).toBe(0)
  expect(reapplyHeTreeOpenState).not.toHaveBeenCalled()
})

test('Test that remount he-tree resync increments treeMountKey', async () => {
  const treeMountKey = ref(0)
  const controller = createProjectHierarchyTreeHeTreeResyncController({
    nextTick: async () => undefined,
    reapplyHeTreeOpenState: vi.fn(),
    requestAnimationFrame: (callback) => {
      callback()
      return 0
    },
    suppressTreeEmit: ref(false),
    treeMountKey
  })
  await controller.resyncHeTreeFromPublishedTreeData({
    remount: true
  })
  expect(treeMountKey.value).toBe(1)
})

test('Test that he-tree resync awaits in-flight work and exposes idle helpers', async () => {
  const treeMountKey = ref(0)
  const gateControl = {
    release: () => undefined as void
  }
  const gate = new Promise<void>((resolve) => {
    gateControl.release = resolve
  })
  const controller = createProjectHierarchyTreeHeTreeResyncController({
    nextTick: async () => {
      await gate
    },
    reapplyHeTreeOpenState: vi.fn(),
    requestAnimationFrame: (callback) => {
      callback()
      return 0
    },
    suppressTreeEmit: ref(false),
    treeMountKey
  })
  const first = controller.resyncHeTreeFromPublishedTreeData()
  await Promise.resolve()
  expect(controller.isProgrammaticHeTreeResyncActive()).toBe(true)
  const second = controller.resyncHeTreeFromPublishedTreeData()
  const idle = controller.awaitHeTreeResyncIdle()
  gateControl.release()
  await Promise.all([first, second, idle])
  expect(controller.isProgrammaticHeTreeResyncActive()).toBe(false)
  await controller.awaitHeTreeResyncIdle()
})
