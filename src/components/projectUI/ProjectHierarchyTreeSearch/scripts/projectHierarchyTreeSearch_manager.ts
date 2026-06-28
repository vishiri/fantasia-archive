import { computed, ref } from 'vue'
import { storeToRefs } from 'pinia'

import { FA_PROJECT_SIDEBAR_MIN_WIDTH_PX } from 'app/types/I_faProjectSidebarDomain'
import { S_FaProjectSidebar } from 'app/src/stores/S_FaProjectSidebar'
import { S_FaUserSettings } from 'app/src/stores/S_FaUserSettings'

import { createUseProjectHierarchyTreeSearch } from '../functions/createUseProjectHierarchyTreeSearch'
import { resolveProjectHierarchyTreeSearchLayout } from '../functions/resolveProjectHierarchyTreeSearchLayout'

export const useProjectHierarchyTreeSearch = createUseProjectHierarchyTreeSearch({
  computed,
  fixedSearchWidthPx: FA_PROJECT_SIDEBAR_MIN_WIDTH_PX,
  ref,
  resolveProjectHierarchyTreeSearchLayout,
  S_FaProjectSidebar,
  S_FaUserSettings,
  storeToRefs
})
