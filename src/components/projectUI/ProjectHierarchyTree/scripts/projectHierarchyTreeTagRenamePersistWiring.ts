import type { I_faOpenedDocumentTab } from 'app/types/I_faOpenedDocumentsDomain'
import type { I_faProjectHierarchyTreeHeTreeNode } from 'app/types/I_faProjectHierarchyTreeDomain'

import { getFaComponentTestingProjectContentOverrides } from 'app/src/scripts/componentTesting/faComponentTestingProjectContentOverridesWiring'
import { renameFaProjectTagForRenderer } from 'app/src/scripts/componentTesting/faComponentTestingProjectContentTagsOverridesWiring'
import { applyOpenedDocumentTagRenameAcrossTabs } from 'app/src/scripts/openedDocuments/openedDocuments_manager'

import { collectProjectHierarchyTreeLoadedTagNodeIdsForRefresh } from '../functions/projectHierarchyTreeLoadedTagNodeIds'

function canRenameFaProjectTagForRenderer (): boolean {
  const overrides = getFaComponentTestingProjectContentOverrides()
  if (overrides?.tagsByWorldId !== undefined) {
    return true
  }
  const api = window.faContentBridgeAPIs?.projectContent
  return typeof api?.renameTag === 'function'
}

export async function persistProjectHierarchyTreeTagRename (input: {
  applyOpenedDocumentTabs: (tabs: I_faOpenedDocumentTab[]) => void
  getOpenedDocumentTabs: () => readonly I_faOpenedDocumentTab[]
  getTreeData: () => readonly I_faProjectHierarchyTreeHeTreeNode[]
  newName: string
  onDismiss: () => void
  refreshHierarchyTreeNodes: (nodeIds: string[]) => void
  refreshLayout: () => Promise<void>
  resyncTreeDataFromLayout: () => void
  tagId: string
}): Promise<void> {
  if (!canRenameFaProjectTagForRenderer()) {
    return
  }
  try {
    const result = await renameFaProjectTagForRenderer({
      newName: input.newName,
      tagId: input.tagId
    })
    input.applyOpenedDocumentTabs(applyOpenedDocumentTagRenameAcrossTabs({
      merged: result.merged,
      mergedFromTagId: result.mergedFromTagId,
      survivingTagId: result.tag.id,
      survivingTagName: result.tag.name,
      tabs: input.getOpenedDocumentTabs()
    }))
    input.onDismiss()
    await input.refreshLayout()
    input.resyncTreeDataFromLayout()
    const mergeRefreshTagNodeIds = result.merged
      ? collectProjectHierarchyTreeLoadedTagNodeIdsForRefresh(
        input.getTreeData(),
        [result.tag.id]
      )
      : []
    if (mergeRefreshTagNodeIds.length > 0) {
      input.refreshHierarchyTreeNodes(mergeRefreshTagNodeIds)
    }
  } catch (error) {
    console.error('[ProjectHierarchyTree] renameTag failed', error)
  }
}
