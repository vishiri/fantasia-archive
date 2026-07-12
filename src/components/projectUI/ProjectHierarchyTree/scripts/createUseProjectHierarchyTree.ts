import { computed, nextTick, onMounted, onUnmounted, ref } from 'vue'
import type { watch as watchFn } from 'vue'
import { storeToRefs } from 'pinia'
import { dragContext } from '@he-tree/vue'

import type { Ref } from 'vue'

import type { S_FaActiveProject } from 'app/src/stores/S_FaActiveProject'
import type { S_FaOpenedDocuments } from 'app/src/stores/S_FaOpenedDocuments'
import type { S_FaProjectHierarchyTree } from 'app/src/stores/S_FaProjectHierarchyTree'
import type { S_FaUserSettings } from 'app/src/stores/S_FaUserSettings'
import type {
  I_faProjectHierarchyTreeHeTreeNode,
  I_faProjectHierarchyTreeUiState,
  I_faProjectHierarchyTreeWorkspaceWorld
} from 'app/types/I_faProjectHierarchyTreeDomain'

import { createProjectHierarchyTreeSessionWiring } from './projectHierarchyTreeSessionWiring'

import type {
  I_faOpenedDocumentTreeOpenMeta,
  T_faOpenedDocumentOpenMode
} from 'app/types/I_faOpenedDocumentsDomain'

type T_useProjectHierarchyTreeOptions = {
  onDocumentOpenRequest: (
    documentId: string,
    mode: T_faOpenedDocumentOpenMode,
    treeMeta: I_faOpenedDocumentTreeOpenMeta
  ) => void
}

type T_useProjectHierarchyTree = (
  opts: T_useProjectHierarchyTreeOptions
) => ReturnType<typeof createProjectHierarchyTreeSessionWiring> & {
  activeDocumentId: Ref<string | null>
}

export function createUseProjectHierarchyTree (deps: {
  S_FaActiveProject: typeof S_FaActiveProject
  S_FaOpenedDocuments: typeof S_FaOpenedDocuments
  S_FaProjectHierarchyTree: typeof S_FaProjectHierarchyTree
  S_FaUserSettings: typeof S_FaUserSettings
  computed: typeof computed
  dragContext: typeof dragContext
  nextTick: typeof nextTick
  onMounted: typeof onMounted
  onUnmounted: typeof onUnmounted
  ref: typeof ref
  resolveFaDocumentWorkspaceRouteDocumentId: (routePath: string) => string | null
  storeToRefs: typeof storeToRefs
  useRoute: () => {
    path?: string
  }
  watch: typeof watchFn
}): T_useProjectHierarchyTree {
  return function useProjectHierarchyTree (opts) {
    const hierarchyStore = deps.S_FaProjectHierarchyTree()
    const { pendingDocumentRefreshIds, pendingHierarchyNodeRefreshIds, pendingRevealPath, treeData, uiState, worlds } = deps.storeToRefs(hierarchyStore)
    const route = deps.useRoute()
    const activeDocumentId = deps.computed((): string | null => {
      return deps.resolveFaDocumentWorkspaceRouteDocumentId(route.path ?? '')
    })

    const sessionApi = createProjectHierarchyTreeSessionWiring({
      S_FaActiveProject: deps.S_FaActiveProject,
      computed: deps.computed,
      createTemporaryDocument: (input) => deps.S_FaOpenedDocuments().createTemporaryDocument(input),
      dragContext: deps.dragContext,
      hierarchyStore,
      nextTick: deps.nextTick,
      onDocumentOpenRequest: opts.onDocumentOpenRequest,
      onMounted: deps.onMounted,
      onUnmounted: deps.onUnmounted,
      pendingDocumentRefreshIds: pendingDocumentRefreshIds as Ref<string[]>,
      pendingHierarchyNodeRefreshIds: pendingHierarchyNodeRefreshIds as Ref<string[]>,
      pendingRevealPath: pendingRevealPath as Ref<string[]>,
      ref: deps.ref,
      resolvePreferredLanguageCode: () => deps.S_FaUserSettings().settings?.languageCode ?? 'en-US',
      treeData: treeData as Ref<I_faProjectHierarchyTreeHeTreeNode[]>,
      uiState: uiState as Ref<I_faProjectHierarchyTreeUiState>,
      watch: deps.watch,
      worlds: worlds as Ref<I_faProjectHierarchyTreeWorkspaceWorld[]>
    })

    return {
      activeDocumentId,
      ...sessionApi
    }
  }
}
