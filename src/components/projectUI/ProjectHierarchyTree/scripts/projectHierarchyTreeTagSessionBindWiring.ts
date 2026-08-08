import type { Ref, watch as watchFn } from 'vue'

import type { S_FaActiveProject } from 'app/src/stores/S_FaActiveProject'
import type { S_FaOpenedDocuments } from 'app/src/stores/S_FaOpenedDocuments'
import type { S_FaProjectHierarchyTree } from 'app/src/stores/S_FaProjectHierarchyTree'
import type { S_FaUserSettings } from 'app/src/stores/S_FaUserSettings'
import type {
  I_faOpenedDocumentTreeOpenMeta,
  T_faOpenedDocumentOpenMode
} from 'app/types/I_faOpenedDocumentsDomain'
import type {
  I_faProjectHierarchyTreeHeTreeNode,
  I_faProjectHierarchyTreeUiState,
  I_faProjectHierarchyTreeWorkspaceWorld
} from 'app/types/I_faProjectHierarchyTreeDomain'

import { FA_USER_SETTINGS_DEFAULTS } from 'app/src-electron/mainScripts/userSettings/faUserSettingsDefaults'
import { resolveProjectHierarchyTreeForceSublevelCollapse } from '../functions/projectHierarchyTreeForceSublevelCollapse'
import { createProjectHierarchyTreeSessionWiring } from './projectHierarchyTreeSessionWiring'
import { bindProjectHierarchyTreeTagSkeletonResolvers } from './projectHierarchyTreeSyncMapperWiring'
import {
  bindProjectHierarchyTreeTagSettingsResyncWatch,
  createProjectHierarchyTreeTagSettingsForceResyncWithExpandRestore
} from './projectHierarchyTreeTagSettingsResyncWiring'

export function bindProjectHierarchyTreeTagSessionWiring (deps: {
  S_FaActiveProject: typeof S_FaActiveProject
  S_FaOpenedDocuments: typeof S_FaOpenedDocuments
  S_FaUserSettings: typeof S_FaUserSettings
  computed: typeof import('vue').computed
  dragContext: typeof import('@he-tree/vue').dragContext
  hierarchyStore: ReturnType<typeof S_FaProjectHierarchyTree>
  i18nT: (key: string) => string
  layoutRefreshGeneration: Ref<number>
  nextTick: typeof import('vue').nextTick
  onDocumentOpenRequest: (
    documentId: string,
    mode: T_faOpenedDocumentOpenMode,
    treeMeta: I_faOpenedDocumentTreeOpenMeta
  ) => void
  onMounted: typeof import('vue').onMounted
  onUnmounted: typeof import('vue').onUnmounted
  pendingDocumentRefreshIds: Ref<string[]>
  pendingHierarchyNodeRefreshIds: Ref<string[]>
  pendingRevealPath: Ref<string[]>
  ref: typeof import('vue').ref
  runFaAction: typeof import('app/src/scripts/actionManager/faActionManagerRun_manager').runFaAction
  treeData: Ref<I_faProjectHierarchyTreeHeTreeNode[]>
  uiState: Ref<I_faProjectHierarchyTreeUiState>
  watch: typeof watchFn
  worlds: Ref<I_faProjectHierarchyTreeWorkspaceWorld[]>
}) {
  bindProjectHierarchyTreeTagSkeletonResolvers({
    resolveTagSettings: () => {
      const userSettingsStore = deps.S_FaUserSettings()
      const settings = userSettingsStore.settings
      const preview = userSettingsStore.appSettingsDialogPreview
      return {
        compactTags: preview?.compactTags ?? settings?.compactTags ?? FA_USER_SETTINGS_DEFAULTS.compactTags,
        noTags: preview?.noTags ?? settings?.noTags ?? FA_USER_SETTINGS_DEFAULTS.noTags,
        tagsAtTop: preview?.tagsAtTop ?? settings?.tagsAtTop ?? FA_USER_SETTINGS_DEFAULTS.tagsAtTop
      }
    },
    resolveTagsLabel: () => deps.i18nT('projectUI.projectHierarchyTree.tagsWrapperLabel')
  })

  const sessionApi = createProjectHierarchyTreeSessionWiring({
    S_FaActiveProject: deps.S_FaActiveProject,
    applyOpenedDocumentTabs: (nextTabs) => {
      deps.S_FaOpenedDocuments().replaceOpenedDocumentTabs(nextTabs)
    },
    computed: deps.computed,
    createTemporaryDocument: (input) => deps.S_FaOpenedDocuments().createTemporaryDocument(input),
    dragContext: deps.dragContext,
    getOpenedDocumentTabs: () => deps.S_FaOpenedDocuments().tabs,
    hierarchyStore: deps.hierarchyStore,
    layoutRefreshGeneration: deps.layoutRefreshGeneration,
    nextTick: deps.nextTick,
    onDocumentOpenRequest: deps.onDocumentOpenRequest,
    onMounted: deps.onMounted,
    onUnmounted: deps.onUnmounted,
    pendingDocumentRefreshIds: deps.pendingDocumentRefreshIds,
    pendingHierarchyNodeRefreshIds: deps.pendingHierarchyNodeRefreshIds,
    pendingRevealPath: deps.pendingRevealPath,
    ref: deps.ref,
    resolveForceSublevelCollapseInTree: () => {
      const userSettingsStore = deps.S_FaUserSettings()
      return resolveProjectHierarchyTreeForceSublevelCollapse(
        userSettingsStore.settings,
        userSettingsStore.appSettingsDialogPreview,
        {
          forceSublevelCollapseInTree: FA_USER_SETTINGS_DEFAULTS.forceSublevelCollapseInTree
        }
      )
    },
    resolvePreferredLanguageCode: () => deps.S_FaUserSettings().settings?.languageCode ?? 'en-US',
    runFaAction: deps.runFaAction,
    treeData: deps.treeData,
    uiState: deps.uiState,
    watch: deps.watch,
    worlds: deps.worlds
  })

  bindProjectHierarchyTreeTagSettingsResyncWatch({
    S_FaUserSettings: deps.S_FaUserSettings,
    forceResyncTreeDataFromLayout: createProjectHierarchyTreeTagSettingsForceResyncWithExpandRestore({
      forceResyncTreeDataFromLayout: sessionApi.forceResyncTreeDataFromLayout,
      restoreExpandedSnapshot: sessionApi.restoreExpandedSnapshot,
      uiState: deps.uiState
    }),
    watch: deps.watch
  })

  return sessionApi
}
