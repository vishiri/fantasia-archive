import { flushPromises } from '@vue/test-utils'
import { ref, nextTick } from 'vue'
import { expect, test, vi } from 'vitest'

import { createDialogProjectSettingsWorldTemplateLayoutTreeDragCancelWiring } from '../dialogProjectSettingsWorldTemplateLayoutTreeDragCancelWiring'
import { scheduleDialogProjectSettingsWorldTemplateLayoutTreeDragCommit } from '../dialogProjectSettingsWorldTemplateLayoutTreeDragCommitWiring'
import { createDialogProjectSettingsWorldTemplateLayoutTreeWiring } from '../dialogProjectSettingsWorldTemplateLayoutTreeWiring'
import * as emitGuard from '../dialogProjectSettingsWorldTemplateLayoutTreeEmitGuard'
import { createDialogProjectSettingsWorldTemplateLayoutTreeSyncWiring } from '../dialogProjectSettingsWorldTemplateLayoutTreeSyncWiring'
import { createEmptyDialogProjectSettingsWorldTemplateLayoutDraft } from '../dialogProjectSettingsWorldTemplateLayoutDraft'
import { buildHeTreeNodesFromWorldTemplateLayoutDraft } from '../functions/dialogProjectSettingsWorldTemplateLayoutTreeData'

/**
 * dialogProjectSettingsWorldTemplateLayoutTreeDragCancelWiring
 * Clears drag session state when Escape is pressed during drag.
 */
test('Test that drag cancel wiring clears session on Escape keydown', () => {
  const dragCommitPending = ref(true)
  const dragDropCommitted = ref(false)
  const cleared = ref(false)
  const wiring = createDialogProjectSettingsWorldTemplateLayoutTreeDragCancelWiring({
    clearDragSessionFlags: () => {
      cleared.value = true
    },
    dragCommitPending,
    dragDropCommitted,
    nextTick: async () => {},
    removeDragCancelListeners: () => {}
  })
  wiring.onWindowKeydownDuringDrag(new KeyboardEvent('keydown', {
    key: 'Escape'
  }))
  expect(cleared.value).toBe(true)
})

/**
 * dialogProjectSettingsWorldTemplateLayoutTreeDragCancelWiring
 * finishDragSessionWithoutCommit clears drag flags when drop was not committed.
 */
test('Test that drag cancel wiring finishDragSessionWithoutCommit clears session', () => {
  const dragCommitPending = ref(true)
  const dragDropCommitted = ref(false)
  const cleared = ref(false)
  const wiring = createDialogProjectSettingsWorldTemplateLayoutTreeDragCancelWiring({
    clearDragSessionFlags: () => {
      cleared.value = true
    },
    dragCommitPending,
    dragDropCommitted,
    nextTick: async () => {},
    removeDragCancelListeners: () => {}
  })
  wiring.finishDragSessionWithoutCommit()
  expect(cleared.value).toBe(true)
})

/**
 * dialogProjectSettingsWorldTemplateLayoutTreeDragCancelWiring
 * pointerup after an uncommitted drag clears the drag session.
 */
test('Test that drag cancel wiring clears session on pointerup after drag', async () => {
  const dragCommitPending = ref(true)
  const dragDropCommitted = ref(false)
  const cleared = ref(false)
  const wiring = createDialogProjectSettingsWorldTemplateLayoutTreeDragCancelWiring({
    clearDragSessionFlags: () => {
      cleared.value = true
    },
    dragCommitPending,
    dragDropCommitted,
    nextTick,
    removeDragCancelListeners: () => {}
  })
  wiring.onWindowPointerUpDuringDrag()
  await flushPromises()
  expect(cleared.value).toBe(true)
})

/**
 * dialogProjectSettingsWorldTemplateLayoutTreeDragCancelWiring
 * Ignores non-Escape keys during drag cancel handling.
 */
test('Test that drag cancel wiring ignores non-Escape keydown events', () => {
  const cleared = ref(false)
  const wiring = createDialogProjectSettingsWorldTemplateLayoutTreeDragCancelWiring({
    clearDragSessionFlags: () => {
      cleared.value = true
    },
    dragCommitPending: ref(true),
    dragDropCommitted: ref(false),
    nextTick: async () => {},
    removeDragCancelListeners: () => {}
  })
  wiring.onWindowKeydownDuringDrag(new KeyboardEvent('keydown', {
    key: 'Enter'
  }))
  expect(cleared.value).toBe(false)
})

/**
 * dialogProjectSettingsWorldTemplateLayoutTreeDragCancelWiring
 * Ignores pointer cancel cleanup after a successful drop commit flag is set.
 */
test('Test that drag cancel wiring ignores pointer cleanup after drop commit', async () => {
  const dragCommitPending = ref(true)
  const dragDropCommitted = ref(true)
  const cleared = ref(false)
  const wiring = createDialogProjectSettingsWorldTemplateLayoutTreeDragCancelWiring({
    clearDragSessionFlags: () => {
      cleared.value = true
    },
    dragCommitPending,
    dragDropCommitted,
    nextTick: async () => {},
    removeDragCancelListeners: () => {}
  })
  wiring.onWindowPointerUpDuringDrag()
  await Promise.resolve()
  expect(cleared.value).toBe(false)
})

/**
 * dialogProjectSettingsWorldTemplateLayoutTreeDragCancelWiring
 * Skips cancel cleanup when after-drop already marked the session committed.
 */
test('Test that drag cancel wiring skips finish when drop already committed', () => {
  const dragCommitPending = ref(true)
  const dragDropCommitted = ref(true)
  const cleared = ref(false)
  const wiring = createDialogProjectSettingsWorldTemplateLayoutTreeDragCancelWiring({
    clearDragSessionFlags: () => {
      cleared.value = true
    },
    dragCommitPending,
    dragDropCommitted,
    nextTick: async () => {},
    removeDragCancelListeners: () => {}
  })
  wiring.finishDragSessionWithoutCommit()
  expect(cleared.value).toBe(false)
})

/**
 * dialogProjectSettingsWorldTemplateLayoutTreeDragCommitWiring
 * Skips layout emit while suppressTreeEmit remains true at commit time.
 */
test('Test that drag commit wiring skips emit when suppressTreeEmit is true', async () => {
  vi.stubGlobal('requestAnimationFrame', (callback: FrameRequestCallback) => {
    callback(performance.now())
    return 1
  })
  const dragCommitPending = ref(true)
  const dragCommitScheduled = ref(false)
  const suppressTreeEmit = ref(true)
  let emitCount = 0
  scheduleDialogProjectSettingsWorldTemplateLayoutTreeDragCommit({
    dragCommitPending,
    dragCommitScheduled,
    emitLayoutFromTreeDataIfChanged: () => {
      emitCount += 1
    },
    nextTick: async () => {},
    removeDragCancelListeners: () => {},
    suppressTreeEmit
  })
  await Promise.resolve()
  await Promise.resolve()
  expect(emitCount).toBe(0)
  vi.unstubAllGlobals()
})

/**
 * dialogProjectSettingsWorldTemplateLayoutTreeSyncWiring
 * Resyncs tree nodes from props without emitting layout changes.
 */
test('Test that tree sync wiring rebuilds treeData from props layout', async () => {
  const layout = createEmptyDialogProjectSettingsWorldTemplateLayoutDraft()
  layout.placements = [
    {
      templateDisplayName: 'Character',

      nickname: '',
      documentCountInWorld: 0,
      documentTemplateId: 'template-a',
      groupId: null,
      groupSortOrder: null,
      icon: 'mdi-account',
      id: 'placement-a',
      rootSortOrder: 0,
      worldAppendix: ''
    }
  ]
  const treeData = ref([])
  const suppressTreeEmit = ref(false)
  const wiring = createDialogProjectSettingsWorldTemplateLayoutTreeSyncWiring({
    emitTemplateLayout: () => {},
    getTemplateLayout: () => layout,
    nextTick,
    suppressTreeEmit,
    treeData
  })
  wiring.resyncTreeDataFromProps()
  await flushPromises()
  expect(treeData.value).toHaveLength(1)
  expect(suppressTreeEmit.value).toBe(false)
})

/**
 * dialogProjectSettingsWorldTemplateLayoutTreeSyncWiring
 * Patches display labels in place when tree structure matches props layout.
 */
test('Test that tree sync wiring patches labels without rebuilding tree nodes', () => {
  const layout = createEmptyDialogProjectSettingsWorldTemplateLayoutDraft()
  layout.placements = [
    {
      templateDisplayName: 'Character',

      nickname: '',
      documentCountInWorld: 0,
      documentTemplateId: 'template-a',
      groupId: null,
      groupSortOrder: null,
      icon: 'mdi-account',
      id: 'placement-a',
      rootSortOrder: 0,
      worldAppendix: ''
    }
  ]
  const treeData = ref(buildHeTreeNodesFromWorldTemplateLayoutDraft(layout))
  const initialNodeRef = treeData.value[0]
  layout.placements[0]!.templateDisplayName = 'Hero'
  const wiring = createDialogProjectSettingsWorldTemplateLayoutTreeSyncWiring({
    emitTemplateLayout: () => {},
    getTemplateLayout: () => layout,
    nextTick,
    suppressTreeEmit: ref(false),
    treeData
  })
  wiring.resyncTreeDataFromProps()
  expect(treeData.value[0]).toBe(initialNodeRef)
  expect(treeData.value[0]?.label).toBe('Hero')
})

/**
 * dialogProjectSettingsWorldTemplateLayoutTreeSyncWiring
 * Rebuilds tree nodes when structure keys diverge even if treeData is populated.
 */
test('Test that tree sync wiring rebuilds when structure keys diverge', () => {
  const layout = createEmptyDialogProjectSettingsWorldTemplateLayoutDraft()
  layout.placements = [
    {
      templateDisplayName: 'Character',

      nickname: '',
      documentCountInWorld: 0,
      documentTemplateId: 'template-a',
      groupId: null,
      groupSortOrder: null,
      icon: 'mdi-account',
      id: 'placement-a',
      rootSortOrder: 0,
      worldAppendix: ''
    }
  ]
  const treeData = ref([
    {
      children: [],
      documentCountInWorld: 0,
      documentTemplateId: 'template-b',
      icon: 'mdi-map',
      id: 'placement-b',
      label: 'Location',
      nodeKind: 'template',
      nickname: '',
      templateDisplayName: '',
      usesNickname: false,
      worldAppendix: ''
    }
  ] as ReturnType<typeof buildHeTreeNodesFromWorldTemplateLayoutDraft>)
  const wiring = createDialogProjectSettingsWorldTemplateLayoutTreeSyncWiring({
    emitTemplateLayout: () => {},
    getTemplateLayout: () => layout,
    nextTick,
    suppressTreeEmit: ref(false),
    treeData
  })
  wiring.resyncTreeDataFromProps()
  expect(treeData.value).toHaveLength(1)
  expect(treeData.value[0]?.label).toBe('Character')
})

/**
 * dialogProjectSettingsWorldTemplateLayoutTreeSyncWiring
 * Resyncs instead of emitting when regression guard blocks stale grouped-to-root mapping.
 */
test('Test that tree sync wiring resyncs when regression guard blocks layout emit', () => {
  const priorLayout = createEmptyDialogProjectSettingsWorldTemplateLayoutDraft()
  priorLayout.groups = [
    {
      displayName: 'Creatures',
      id: '770e8400-e29b-41d4-a716-446655440001',
      rootSortOrder: 0
    }
  ]
  priorLayout.placements = [
    {
      templateDisplayName: 'Character',

      nickname: '',
      documentCountInWorld: 0,
      documentTemplateId: 'template-a',
      groupId: '770e8400-e29b-41d4-a716-446655440001',
      groupSortOrder: 0,
      icon: 'mdi-account',
      id: '880e8400-e29b-41d4-a716-446655440001',
      rootSortOrder: null,
      worldAppendix: ''
    }
  ]
  const groupedNodes = buildHeTreeNodesFromWorldTemplateLayoutDraft(priorLayout)
  const staleRootNode = {
    children: [],
    documentCountInWorld: 0,
    documentTemplateId: 'template-a',
    icon: 'mdi-account',
    id: '880e8400-e29b-41d4-a716-446655440001',
    label: 'Character',
    nodeKind: 'template',
    nickname: '',
    templateDisplayName: '',
    usesNickname: false,
    worldAppendix: ''
  }
  const treeData = ref([
    ...groupedNodes,
    staleRootNode
  ] as typeof groupedNodes)
  let emitCount = 0
  const wiring = createDialogProjectSettingsWorldTemplateLayoutTreeSyncWiring({
    emitTemplateLayout: () => {
      emitCount += 1
    },
    getTemplateLayout: () => priorLayout,
    nextTick,
    suppressTreeEmit: ref(false),
    treeData
  })
  wiring.emitLayoutFromTreeDataIfChanged()
  expect(emitCount).toBe(0)
})

/**
 * dialogProjectSettingsWorldTemplateLayoutTreeSyncWiring
 * Resyncs treeData when regression guard blocks a stale layout emit.
 */
test('Test that tree sync wiring resyncs when emit guard blocks layout emit', async () => {
  const priorLayout = createEmptyDialogProjectSettingsWorldTemplateLayoutDraft()
  priorLayout.placements = [
    {
      templateDisplayName: 'Character',

      nickname: '',
      documentCountInWorld: 0,
      documentTemplateId: 'template-a',
      groupId: null,
      groupSortOrder: null,
      icon: 'mdi-account',
      id: 'placement-a',
      rootSortOrder: 0,
      worldAppendix: ''
    }
  ]
  const treeData = ref([])
  const suppressTreeEmit = ref(false)
  const blockSpy = vi.spyOn(emitGuard, 'shouldBlockDialogProjectSettingsWorldTemplateLayoutEmit')
    .mockReturnValue(true)
  let emitCount = 0
  const wiring = createDialogProjectSettingsWorldTemplateLayoutTreeSyncWiring({
    emitTemplateLayout: () => {
      emitCount += 1
    },
    getTemplateLayout: () => priorLayout,
    nextTick,
    suppressTreeEmit,
    treeData
  })
  wiring.emitLayoutFromTreeDataIfChanged()
  expect(emitCount).toBe(0)
  expect(suppressTreeEmit.value).toBe(true)
  await flushPromises()
  expect(treeData.value).toHaveLength(1)
  expect(suppressTreeEmit.value).toBe(false)
  blockSpy.mockRestore()
})

/**
 * dialogProjectSettingsWorldTemplateLayoutTreeWiring
 * dragend cleanup clears pending flags when drop was not committed.
 */
test('Test that tree wiring dragend cleanup clears pending flags after cancelled drag', () => {
  const dragCommitPending = ref(true)
  const dragCommitScheduled = ref(true)
  const dragDropCommitted = ref(false)
  const isTreeDragActive = ref(true)
  const wiring = createDialogProjectSettingsWorldTemplateLayoutTreeWiring({
    dragCommitPending,
    dragCommitScheduled,
    dragDropCommitted,
    emitLayoutFromTreeDataIfChanged: () => {},
    isTreeDragActive,
    nextTick: async () => {},
    resyncTreeDataFromProps: () => {},
    suppressTreeEmit: ref(false),
    treeData: ref([])
  })
  wiring.onTreeDragEndCleanup()
  expect(isTreeDragActive.value).toBe(false)
  expect(dragCommitPending.value).toBe(false)
  expect(dragCommitScheduled.value).toBe(false)
})

/**
 * dialogProjectSettingsWorldTemplateLayoutTreeWiring
 * dragend cleanup keeps pending flags when after-drop already committed.
 */
test('Test that tree wiring dragend cleanup keeps pending flags after committed drop', () => {
  const dragCommitPending = ref(true)
  const dragCommitScheduled = ref(true)
  const dragDropCommitted = ref(true)
  const isTreeDragActive = ref(true)
  const wiring = createDialogProjectSettingsWorldTemplateLayoutTreeWiring({
    dragCommitPending,
    dragCommitScheduled,
    dragDropCommitted,
    emitLayoutFromTreeDataIfChanged: () => {},
    isTreeDragActive,
    nextTick: async () => {},
    resyncTreeDataFromProps: () => {},
    suppressTreeEmit: ref(false),
    treeData: ref([])
  })
  wiring.onTreeDragEndCleanup()
  expect(isTreeDragActive.value).toBe(false)
  expect(dragCommitPending.value).toBe(true)
  expect(dragCommitScheduled.value).toBe(true)
})
