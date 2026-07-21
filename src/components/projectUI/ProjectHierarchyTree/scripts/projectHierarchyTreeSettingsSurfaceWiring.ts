import type { computed } from 'vue'
import type { Ref } from 'vue'
import type { storeToRefs } from 'pinia'

import type { S_FaActiveProject } from 'app/src/stores/S_FaActiveProject'
import type { S_FaUserSettings } from 'app/src/stores/S_FaUserSettings'
import type { I_faProjectHierarchyTreeWorkspaceWorld } from 'app/types/I_faProjectHierarchyTreeDomain'

import { createProjectHierarchyTreeDocumentButtonGroupWiring } from './projectHierarchyTreeDocumentButtonGroupWiring'
import { createProjectHierarchyTreeTreeLineWiring } from './projectHierarchyTreeTreeLineWiring'
import { createProjectHierarchyTreePlacementCountWiring } from './projectHierarchyTreePlacementCountWiring'
import { createProjectHierarchyTreeOrderNumberBadgeWiring } from './projectHierarchyTreeOrderNumberBadgeWiring'
import { createProjectHierarchyTreeProjectNameTitleWiring } from './projectHierarchyTreeProjectNameTitleWiring'
import { createProjectHierarchyTreeNodeDisplayBindings } from './projectHierarchyTreeNodeDisplayBindingsWiring'

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
