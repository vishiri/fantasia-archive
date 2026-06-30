import type { Ref } from 'vue'

import type { I_faProjectHierarchyTreeHeTreeNode } from 'app/types/I_faProjectHierarchyTreeDomain'

import {
  mapWorkspaceLayoutToHierarchyTreeSkeleton,
  patchHierarchyTreeSkeletonLabelsInPlace
} from '../functions/mapWorkspaceLayoutToHierarchyTreeSkeleton'
import { projectHierarchyTreeLayoutStructureMatchesTree } from './projectHierarchyTreeLayoutStructureMatch'

export function createProjectHierarchyTreeSyncWiring (deps: {
  getWorlds: () => import('app/types/I_faProjectHierarchyTreeDomain').I_faProjectHierarchyTreeWorkspaceWorld[]
  nextTick: () => Promise<void>
  suppressTreeEmit: Ref<boolean>
  treeData: Ref<I_faProjectHierarchyTreeHeTreeNode[]>
}) {
  function resyncTreeDataFromLayout (): void {
    const worlds = deps.getWorlds()
    if (worlds.length === 0) {
      deps.treeData.value = []
      return
    }
    const nextSkeleton = mapWorkspaceLayoutToHierarchyTreeSkeleton(worlds)
    if (
      deps.treeData.value.length > 0 &&
      projectHierarchyTreeLayoutStructureMatchesTree(deps.treeData.value, worlds)
    ) {
      patchHierarchyTreeSkeletonLabelsInPlace(deps.treeData.value, worlds)
      return
    }
    deps.suppressTreeEmit.value = true
    deps.treeData.value = nextSkeleton
    void deps.nextTick().then(() => {
      deps.suppressTreeEmit.value = false
    })
  }

  return {
    resyncTreeDataFromLayout
  }
}
