import { computed, ref, watch } from 'vue'
import { storeToRefs } from 'pinia'
import debounce from 'lodash-es/debounce.js'

import { FA_PROJECT_SIDEBAR_MIN_WIDTH_PX } from 'app/types/I_faProjectSidebarDomain'
import { S_FaProjectHierarchyTree } from 'app/src/stores/S_FaProjectHierarchyTree'
import { S_FaProjectSidebar } from 'app/src/stores/S_FaProjectSidebar'
import { S_FaUserSettings } from 'app/src/stores/S_FaUserSettings'

import { createUseProjectHierarchyTreeSearch } from '../functions/createUseProjectHierarchyTreeSearch'
import { resolveProjectHierarchyTreeSearchLayout } from '../functions/resolveProjectHierarchyTreeSearchLayout'
import { createUseProjectHierarchyTreeSearchDebounced } from './projectHierarchyTreeSearchDebouncedWiring'
import { runProjectHierarchyTreeSearchQuery } from './projectHierarchyTreeSearchQueryWiring'

export const useProjectHierarchyTreeSearch = createUseProjectHierarchyTreeSearchDebounced({
  SEARCH_DEBOUNCE_MS: 300,
  S_FaProjectHierarchyTree,
  computed,
  createUseProjectHierarchyTreeSearch,
  debounce,
  fixedSearchWidthPx: FA_PROJECT_SIDEBAR_MIN_WIDTH_PX,
  ref,
  resolveProjectHierarchyTreeSearchLayout,
  runProjectHierarchyTreeSearchQuery,
  S_FaProjectSidebar,
  S_FaUserSettings,
  storeToRefs,
  watch
})
