import type { Ref } from 'vue'

import type {
  I_dialogProjectSettingsWorldTemplateLayoutDraft,
  I_dialogProjectSettingsWorldTemplateLayoutHeTreeNode
} from 'app/types/I_dialogProjectSettingsWorlds'

import {
  mapDialogProjectSettingsWorldTemplateLayoutToSnapshot
} from './dialogProjectSettingsWorldTemplateLayoutDraft'
import { normalizeDialogProjectSettingsWorldTemplateLayoutRootOrder } from './dialogProjectSettingsWorldTemplateLayoutRootOrder'
import {
  buildHeTreeNodesFromWorldTemplateLayoutDraft,
  mapDialogProjectSettingsWorldTemplateLayoutToTreeStructureKey,
  patchWorldTemplateLayoutDisplayLabelsInHeTreeNodes
} from './functions/dialogProjectSettingsWorldTemplateLayoutTreeData'
import {
  mapHeTreeNodesToWorldTemplateLayoutDraft
} from './functions/dialogProjectSettingsWorldTemplateLayoutTreeReverseMap'
import {
  mergeOrphanPlacementsFromPriorWorldTemplateLayout
} from './functions/dialogProjectSettingsWorldTemplateLayoutOrphanPlacements'
import {
  shouldBlockDialogProjectSettingsWorldTemplateLayoutEmit
} from './dialogProjectSettingsWorldTemplateLayoutTreeEmitGuard'

function areTemplateLayoutDraftSnapshotsEqual (
  left: I_dialogProjectSettingsWorldTemplateLayoutDraft,
  right: I_dialogProjectSettingsWorldTemplateLayoutDraft
): boolean {
  const leftSnapshot = mapDialogProjectSettingsWorldTemplateLayoutToSnapshot(left)
  const rightSnapshot = mapDialogProjectSettingsWorldTemplateLayoutToSnapshot(right)
  return JSON.stringify(leftSnapshot) === JSON.stringify(rightSnapshot)
}

export function createDialogProjectSettingsWorldTemplateLayoutTreeSyncWiring (deps: {
  emitTemplateLayout: (layout: I_dialogProjectSettingsWorldTemplateLayoutDraft) => void
  getTemplateLayout: () => I_dialogProjectSettingsWorldTemplateLayoutDraft
  nextTick: () => Promise<void>
  suppressTreeEmit: Ref<boolean>
  treeData: Ref<I_dialogProjectSettingsWorldTemplateLayoutHeTreeNode[]>
}) {
  function resyncTreeDataFromProps (): void {
    const layout = deps.getTemplateLayout()
    if (deps.treeData.value.length > 0) {
      const mappedFromTree = mapHeTreeNodesToWorldTemplateLayoutDraft(
        deps.treeData.value,
        layout
      )
      const layoutStructureKey = mapDialogProjectSettingsWorldTemplateLayoutToTreeStructureKey(layout)
      const treeStructureKey = mapDialogProjectSettingsWorldTemplateLayoutToTreeStructureKey(mappedFromTree)
      if (layoutStructureKey === treeStructureKey) {
        patchWorldTemplateLayoutDisplayLabelsInHeTreeNodes(deps.treeData.value, layout)
        return
      }
    }
    deps.suppressTreeEmit.value = true
    deps.treeData.value = buildHeTreeNodesFromWorldTemplateLayoutDraft(layout)
    void deps.nextTick().then(() => {
      return deps.nextTick()
    }).then(() => {
      deps.suppressTreeEmit.value = false
    })
  }

  function emitLayoutFromTreeDataIfChanged (): void {
    const mapped = mapHeTreeNodesToWorldTemplateLayoutDraft(deps.treeData.value, deps.getTemplateLayout())
    const merged = mergeOrphanPlacementsFromPriorWorldTemplateLayout(mapped, deps.getTemplateLayout())
    const nextLayout = normalizeDialogProjectSettingsWorldTemplateLayoutRootOrder(merged)
    if (areTemplateLayoutDraftSnapshotsEqual(deps.getTemplateLayout(), nextLayout)) {
      return
    }
    if (shouldBlockDialogProjectSettingsWorldTemplateLayoutEmit(
      deps.getTemplateLayout(),
      nextLayout,
      deps.treeData.value
    )) {
      resyncTreeDataFromProps()
      return
    }
    deps.emitTemplateLayout(nextLayout)
  }

  return {
    emitLayoutFromTreeDataIfChanged,
    resyncTreeDataFromProps
  }
}
