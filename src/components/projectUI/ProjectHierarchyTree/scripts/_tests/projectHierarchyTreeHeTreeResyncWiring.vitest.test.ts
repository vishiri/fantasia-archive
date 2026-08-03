/** @vitest-environment jsdom */
import { expect, test } from 'vitest'
import { ref } from 'vue'

import { createProjectHierarchyTreeHeTreeResyncController } from '../projectHierarchyTreeHeTreeHelpersWiring'

test('Test that soft he-tree resync skips remount and open reapply', async () => {
  const suppressTreeEmit = ref(false)
  const controller = createProjectHierarchyTreeHeTreeResyncController({
    nextTick: async () => undefined,
    suppressTreeEmit
  })
  await controller.resyncHeTreeFromPublishedTreeData()
  expect(suppressTreeEmit.value).toBe(false)
})

test('Test that he-tree resync awaits in-flight work and exposes idle helpers', async () => {
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
    suppressTreeEmit: ref(false)
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
