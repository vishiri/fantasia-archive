import type { Ref } from 'vue'
import type { watch as WatchFn } from 'vue'

import type { I_faProjectHierarchyTreeHeTreeNode } from 'app/types/I_faProjectHierarchyTreeDomain'
import type { T_faUserSettingsLanguageCode } from 'app/types/faUserSettingsLanguageRegistry'

import { refreshProjectHierarchyTreeAddNewDocumentLabelsInTree } from './projectHierarchyTreeAddNewDocumentNode'

export function bindProjectHierarchyTreeAddNewDocumentLanguageRefresh (deps: {
  getPreferredLanguageCode: () => T_faUserSettingsLanguageCode
  treeData: Ref<I_faProjectHierarchyTreeHeTreeNode[]>
  watch: typeof WatchFn
}): void {
  deps.watch(() => deps.getPreferredLanguageCode(), () => {
    refreshProjectHierarchyTreeAddNewDocumentLabelsInTree(
      deps.treeData.value,
      deps.getPreferredLanguageCode()
    )
  })
}
