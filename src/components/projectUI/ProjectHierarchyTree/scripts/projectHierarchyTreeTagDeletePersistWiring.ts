import { ResultAsync } from 'neverthrow'
import { Notify } from 'quasar'

import type { I_faOpenedDocumentTab } from 'app/types/I_faOpenedDocumentsDomain'

import { i18n } from 'app/i18n/externalFileLoader'
import { getFaComponentTestingProjectContentOverrides } from 'app/src/scripts/componentTesting/faComponentTestingProjectContentOverridesWiring'
import { deleteFaProjectTagForRenderer } from 'app/src/scripts/componentTesting/faComponentTestingProjectContentTagsOverridesWiring'
import { applyOpenedDocumentTagDeleteAcrossTabs } from 'app/src/scripts/openedDocuments/openedDocuments_manager'

import {
  projectHierarchyTreeTagPersistSuperseded,
  readProjectHierarchyTreeTagPersistEpoch
} from './projectHierarchyTreeTagPersistEpochWiring'

const tagDeletePersistInFlight = new Set<string>()

function canDeleteFaProjectTagForRenderer (): boolean {
  const overrides = getFaComponentTestingProjectContentOverrides()
  if (overrides?.tagsByWorldId !== undefined) {
    return true
  }
  const api = window.faContentBridgeAPIs?.projectContent
  return typeof api?.deleteTag === 'function'
}

/**
 * Persists tag delete via bridge, refreshes layout, then resyncs tree.
 */
export async function persistProjectHierarchyTreeTagDelete (input: {
  applyOpenedDocumentTabs: (tabs: I_faOpenedDocumentTab[]) => void
  getOpenedDocumentTabs: () => readonly I_faOpenedDocumentTab[]
  onDismiss: () => void
  refreshLayout: () => Promise<void>
  resyncTreeDataFromLayout: () => { structureMatched: boolean } | void
  tagId: string
}): Promise<void> {
  if (!canDeleteFaProjectTagForRenderer()) {
    return
  }
  if (tagDeletePersistInFlight.has(input.tagId)) {
    return
  }
  tagDeletePersistInFlight.add(input.tagId)
  try {
    await runProjectHierarchyTreeTagDeletePersist(input)
  } finally {
    tagDeletePersistInFlight.delete(input.tagId)
  }
}

async function runProjectHierarchyTreeTagDeletePersist (input: {
  applyOpenedDocumentTabs: (tabs: I_faOpenedDocumentTab[]) => void
  getOpenedDocumentTabs: () => readonly I_faOpenedDocumentTab[]
  onDismiss: () => void
  refreshLayout: () => Promise<void>
  resyncTreeDataFromLayout: () => { structureMatched: boolean } | void
  tagId: string
}): Promise<void> {
  const epochAtStart = await readProjectHierarchyTreeTagPersistEpoch()
  if (await projectHierarchyTreeTagPersistSuperseded(epochAtStart)) {
    input.onDismiss()
    return
  }
  const deleted = await ResultAsync.fromPromise((async () => {
    await deleteFaProjectTagForRenderer({ tagId: input.tagId })
    if (await projectHierarchyTreeTagPersistSuperseded(epochAtStart)) {
      input.onDismiss()
      return
    }
    input.applyOpenedDocumentTabs(applyOpenedDocumentTagDeleteAcrossTabs({
      deletedTagId: input.tagId,
      tabs: input.getOpenedDocumentTabs()
    }))
    input.onDismiss()
    await input.refreshLayout()
    if (await projectHierarchyTreeTagPersistSuperseded(epochAtStart)) {
      return
    }
    input.resyncTreeDataFromLayout()
    Notify.create({
      group: false,
      message: i18n.global.t('projectUI.projectHierarchyTree.deleteTagSuccess'),
      type: 'positive'
    })
  })(), (error: unknown) => error)
  if (deleted.isErr()) {
    console.error('[ProjectHierarchyTree] deleteTag failed', deleted.error)
    Notify.create({
      faSkipNotifyConsoleLog: true,
      group: false,
      message: i18n.global.t('projectUI.projectHierarchyTree.deleteTagError'),
      type: 'negative'
    })
  }
}
