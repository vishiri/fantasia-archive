import type { I_dialogProjectSettingsWorldTemplateLayoutHeTreeNode } from 'app/types/I_dialogProjectSettingsWorlds'

export type I_dialogProjectSettingsWorldTemplateLayoutTreeWiringApi = {
  clearDragSessionFlags: () => void
  emitLayoutFromTreeDataIfChanged: () => void
  finishDragSessionWithoutCommit: () => void
  onBeforeDragStart: () => void
  onTreeAfterDrop: () => void
  onTreeDataUpdate: (nextNodes: I_dialogProjectSettingsWorldTemplateLayoutHeTreeNode[]) => void
  onTreeDragEndCleanup: () => void
  onUnmountedCleanup: () => void
  removeDragCancelListeners: () => void
  resyncTreeDataFromProps: () => void
}
