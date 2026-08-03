import type { computed } from 'vue'
import type { Ref } from 'vue'
import type { storeToRefs } from 'pinia'
import type { I_computedRef } from 'app/types/I_vueCompositionShims'
import type { T_piniaStoreToRefs } from 'app/types/I_vuePiniaInjected'
import type { I_faActionPayloadMap, T_faActionId } from 'app/types/I_faActionManagerDomain'
import type {
  I_faProjectHierarchyTreeHeTreeNode,
  I_faProjectHierarchyTreeWorkspaceWorld
} from 'app/types/I_faProjectHierarchyTreeDomain'
import type { S_FaActiveProject } from 'app/src/stores/S_FaActiveProject'
import type { S_FaUserSettings } from 'app/src/stores/S_FaUserSettings'
import { FA_USER_SETTINGS_DEFAULTS } from 'app/src-electron/mainScripts/userSettings/faUserSettingsDefaults'
import { resolveFaDocumentTreeOrderNumberBadgeLabel } from 'app/src/scripts/openedDocuments/openedDocuments_manager'

import { resolveProjectHierarchyTreeDocumentButtonVisibility } from '../functions/projectHierarchyTreeDocumentButtonVisibility'
import { resolveProjectHierarchyTreePlacementCountSegments } from '../functions/projectHierarchyTreePlacementCountSegments'
import {
  createProjectHierarchyTreeOrderNumberBadgeWiring,
  createProjectHierarchyTreePlacementCountWiring,
  createProjectHierarchyTreeProjectNameTitleWiring,
  createProjectHierarchyTreeTreeLineWiring
} from './projectHierarchyTreeDisplayChromeWiring'

function resolveDocumentIdFromNode (
  node: I_faProjectHierarchyTreeHeTreeNode
): string | null {
  if (node.nodeKind !== 'document' || node.documentId === null) {
    return null
  }

  return node.documentId
}

export function buildProjectHierarchyTreeDocumentButtonActionHandlers (deps: {
  runFaAction: <Id extends T_faActionId>(id: Id, payload: I_faActionPayloadMap[Id]) => void
}): {
    onDocumentRowAddUnderButtonClick: (node: I_faProjectHierarchyTreeHeTreeNode) => void
    onDocumentRowEditButtonClick: (node: I_faProjectHierarchyTreeHeTreeNode) => void
    onDocumentRowOpenButtonClick: (node: I_faProjectHierarchyTreeHeTreeNode) => void
  } {
  function dispatchDocumentAction (
    node: I_faProjectHierarchyTreeHeTreeNode,
    actionId:
      | 'openHierarchyTreeDocument'
      | 'editHierarchyTreeDocument'
      | 'addHierarchyTreeChildDocument'
  ): void {
    const documentId = resolveDocumentIdFromNode(node)
    if (documentId === null) {
      return
    }

    deps.runFaAction(actionId, { documentId })
  }

  function onDocumentRowOpenButtonClick (node: I_faProjectHierarchyTreeHeTreeNode): void {
    dispatchDocumentAction(node, 'openHierarchyTreeDocument')
  }

  function onDocumentRowEditButtonClick (node: I_faProjectHierarchyTreeHeTreeNode): void {
    dispatchDocumentAction(node, 'editHierarchyTreeDocument')
  }

  function onDocumentRowAddUnderButtonClick (node: I_faProjectHierarchyTreeHeTreeNode): void {
    dispatchDocumentAction(node, 'addHierarchyTreeChildDocument')
  }

  return {
    onDocumentRowAddUnderButtonClick,
    onDocumentRowEditButtonClick,
    onDocumentRowOpenButtonClick
  }
}

export function createProjectHierarchyTreeDocumentButtonGroupWiring (deps: {
  S_FaUserSettings: typeof S_FaUserSettings
  computed: <T>(getter: () => T) => I_computedRef<T>
  runFaAction: <Id extends T_faActionId>(id: Id, payload: I_faActionPayloadMap[Id]) => void
  storeToRefs: T_piniaStoreToRefs
}): {
    documentButtonVisibility: I_computedRef<{
      showsAddUnder: boolean
      showsEdit: boolean
      showsOpen: boolean
    }>
    onDocumentRowAddUnderButtonClick: (node: I_faProjectHierarchyTreeHeTreeNode) => void
    onDocumentRowEditButtonClick: (node: I_faProjectHierarchyTreeHeTreeNode) => void
    onDocumentRowOpenButtonClick: (node: I_faProjectHierarchyTreeHeTreeNode) => void
  } {
  const { appSettingsDialogPreview, settings } = deps.storeToRefs(deps.S_FaUserSettings())!

  const documentButtonVisibility = deps.computed(() => {
    return resolveProjectHierarchyTreeDocumentButtonVisibility(
      settings!.value,
      appSettingsDialogPreview!.value,
      {
        hideTreeIconAddUnder: FA_USER_SETTINGS_DEFAULTS.hideTreeIconAddUnder,
        hideTreeIconEdit: FA_USER_SETTINGS_DEFAULTS.hideTreeIconEdit,
        hideTreeIconView: FA_USER_SETTINGS_DEFAULTS.hideTreeIconView
      }
    )
  })

  const actionHandlers = buildProjectHierarchyTreeDocumentButtonActionHandlers({
    runFaAction: deps.runFaAction
  })

  const onDocumentRowOpenButtonClick = actionHandlers.onDocumentRowOpenButtonClick
  const onDocumentRowEditButtonClick = actionHandlers.onDocumentRowEditButtonClick
  const onDocumentRowAddUnderButtonClick = actionHandlers.onDocumentRowAddUnderButtonClick

  return {
    documentButtonVisibility,
    onDocumentRowAddUnderButtonClick,
    onDocumentRowEditButtonClick,
    onDocumentRowOpenButtonClick
  }
}

export function createProjectHierarchyTreeNodeDisplayBindings (deps: {
  resolvePlacementCountDisplayForCounts: (
    counts: {
      categoryCount: number
      documentCount: number
    }
  ) => ReturnType<typeof resolveProjectHierarchyTreePlacementCountSegments>
  showsOrderNumberBadge: I_computedRef<boolean>
}): {
    resolveOrderNumberBadgeLabelForNode: (
      node: I_faProjectHierarchyTreeHeTreeNode
    ) => string | null
    resolvePlacementCountDisplayForNode: (
      node: I_faProjectHierarchyTreeHeTreeNode
    ) => {
      categoryCount: number
      display: ReturnType<typeof resolveProjectHierarchyTreePlacementCountSegments>
      documentCount: number
    } | null
  } {
  function resolveOrderNumberBadgeLabelForNode (
    node: I_faProjectHierarchyTreeHeTreeNode
  ): string | null {
    if (!deps.showsOrderNumberBadge.value || node.nodeKind !== 'document') {
      return null
    }
    return resolveFaDocumentTreeOrderNumberBadgeLabel(node.treeOrderNumber)
  }

  function resolvePlacementCountDisplayForNode (
    node: I_faProjectHierarchyTreeHeTreeNode
  ): {
    categoryCount: number
    display: ReturnType<typeof resolveProjectHierarchyTreePlacementCountSegments>
    documentCount: number
  } | null {
    if (node.nodeKind !== 'templatePlacement') {
      return null
    }
    const documentCount = node.documentCount ?? 0
    const categoryCount = node.categoryCount ?? 0
    return {
      categoryCount,
      display: deps.resolvePlacementCountDisplayForCounts({
        categoryCount,
        documentCount
      }),
      documentCount
    }
  }

  return {
    resolveOrderNumberBadgeLabelForNode,
    resolvePlacementCountDisplayForNode
  }
}

export function createProjectHierarchyTreeSettingsSurfaceWiring (deps: {
  S_FaActiveProject: typeof S_FaActiveProject
  S_FaUserSettings: typeof S_FaUserSettings
  computed: typeof computed
  runFaAction: typeof import('app/src/scripts/actionManager/faActionManagerRun_manager').runFaAction
  storeToRefs: typeof storeToRefs
  worlds: Ref<I_faProjectHierarchyTreeWorkspaceWorld[]>
}) {
  const documentButtonGroupWiring = createProjectHierarchyTreeDocumentButtonGroupWiring({
    S_FaUserSettings: deps.S_FaUserSettings,
    computed: deps.computed,
    runFaAction: deps.runFaAction,
    storeToRefs: deps.storeToRefs
  })
  const treeLineWiring = createProjectHierarchyTreeTreeLineWiring({
    S_FaUserSettings: deps.S_FaUserSettings,
    computed: deps.computed,
    storeToRefs: deps.storeToRefs
  })
  const placementCountWiring = createProjectHierarchyTreePlacementCountWiring({
    S_FaUserSettings: deps.S_FaUserSettings,
    computed: deps.computed,
    storeToRefs: deps.storeToRefs
  })
  const orderNumberBadgeWiring = createProjectHierarchyTreeOrderNumberBadgeWiring({
    S_FaUserSettings: deps.S_FaUserSettings,
    computed: deps.computed,
    storeToRefs: deps.storeToRefs
  })
  const worldCount = deps.computed(() => {
    return deps.worlds.value.length
  })
  const projectNameTitleWiring = createProjectHierarchyTreeProjectNameTitleWiring({
    S_FaActiveProject: deps.S_FaActiveProject,
    S_FaUserSettings: deps.S_FaUserSettings,
    computed: deps.computed,
    storeToRefs: deps.storeToRefs,
    worldCount
  })
  const nodeDisplayBindings = createProjectHierarchyTreeNodeDisplayBindings({
    resolvePlacementCountDisplayForCounts: placementCountWiring.resolvePlacementCountDisplayForCounts,
    showsOrderNumberBadge: orderNumberBadgeWiring.showsOrderNumberBadge
  })
  return {
    documentButtonGroupWiring,
    nodeDisplayBindings,
    orderNumberBadgeWiring,
    placementCountWiring,
    projectNameTitleWiring,
    treeLineWiring
  }
}
