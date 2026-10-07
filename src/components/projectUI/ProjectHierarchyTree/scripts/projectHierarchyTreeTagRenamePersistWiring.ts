import { ResultAsync } from 'neverthrow'
import { Notify } from 'quasar'

import { i18n } from 'app/i18n/externalFileLoader'

import type { I_faOpenedDocumentTab } from 'app/types/I_faOpenedDocumentsDomain'
import type { I_faProjectHierarchyTreeHeTreeNode } from 'app/types/I_faProjectHierarchyTreeDomain'

import { getFaComponentTestingProjectContentOverrides } from 'app/src/scripts/componentTesting/faComponentTestingProjectContentOverridesWiring'
import { renameFaProjectTagForRenderer } from 'app/src/scripts/componentTesting/faComponentTestingProjectContentTagsOverridesWiring'
import { applyOpenedDocumentTagRenameAcrossTabs } from 'app/src/scripts/openedDocuments/openedDocuments_manager'

import { collectProjectHierarchyTreeLoadedTagNodeIdsForRefresh } from '../functions/projectHierarchyTreeLoadedTagNodeIds'
import {
  projectHierarchyTreeTagPersistSuperseded,
  readProjectHierarchyTreeTagPersistEpoch
} from './projectHierarchyTreeTagPersistEpochWiring'

const tagRenamePersistInFlight = new Set<string>()

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
  shouldKeepOpen?: () => boolean
  tagId: string
}): Promise<void> {
  if (!canRenameFaProjectTagForRenderer()) {
    return
  }
  if (tagRenamePersistInFlight.has(input.tagId)) {
    return
  }
  tagRenamePersistInFlight.add(input.tagId)
  try {
    await runProjectHierarchyTreeTagRenamePersist(input)
  } finally {
    tagRenamePersistInFlight.delete(input.tagId)
  }
}

async function runProjectHierarchyTreeTagRenamePersist (input: {
  applyOpenedDocumentTabs: (tabs: I_faOpenedDocumentTab[]) => void
  getOpenedDocumentTabs: () => readonly I_faOpenedDocumentTab[]
  getTreeData: () => readonly I_faProjectHierarchyTreeHeTreeNode[]
  newName: string
  onDismiss: () => void
  refreshHierarchyTreeNodes: (nodeIds: string[]) => void
  refreshLayout: () => Promise<void>
  resyncTreeDataFromLayout: () => void
  shouldKeepOpen?: () => boolean
  tagId: string
}): Promise<void> {
  const epochAtStart = await readProjectHierarchyTreeTagPersistEpoch()
  if (await projectHierarchyTreeTagPersistSuperseded(epochAtStart)) {
    input.onDismiss()
    return
  }
  const renamed = await ResultAsync.fromPromise((async () => {
    const result = await renameFaProjectTagForRenderer({
      newName: input.newName,
      tagId: input.tagId
    })
    if (await projectHierarchyTreeTagPersistSuperseded(epochAtStart)) {
      input.onDismiss()
      return
    }
    input.applyOpenedDocumentTabs(applyOpenedDocumentTagRenameAcrossTabs({
      merged: result.merged,
      mergedFromTagId: result.mergedFromTagId,
      survivingTagId: result.tag.id,
      survivingTagName: result.tag.name,
      tabs: input.getOpenedDocumentTabs()
    }))
    if (input.shouldKeepOpen?.() !== true) {
      input.onDismiss()
    }
    await input.refreshLayout()
    if (await projectHierarchyTreeTagPersistSuperseded(epochAtStart)) {
      return
    }
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
  })(), (error: unknown) => error)
  if (renamed.isErr()) {
    console.error('[ProjectHierarchyTree] renameTag failed', renamed.error)
    Notify.create({
      faSkipNotifyConsoleLog: true,
      group: false,
      message: i18n.global.t('projectUI.projectHierarchyTree.renameTagError'),
      type: 'negative'
    })
  }
}
